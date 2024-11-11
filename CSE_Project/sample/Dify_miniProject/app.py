from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# DifyのAPI設定
DIFY_API_KEY = os.getenv('DIFY_API_KEY')
DIFY_BASE_URL = "https://api.dify.ai/v1"
WORKFLOW_ENDPOINT = f"{DIFY_BASE_URL}/workflows/run"

headers = {
    'Authorization': f'Bearer {DIFY_API_KEY}',
    'Content-Type': 'application/json'
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_input = request.json.get('message')
    
    # Workflowのリクエストペイロード
    payload = {
        'inputs': {
            'text': user_input,
            'select': 'option1'  # デフォルトのオプション値を設定
        },
        'response_mode': 'blocking',
        'user': 'default_user'
    }
    
    try:
        # パラメータ情報を取得するリクエストを送信
        params_response = requests.get(
            f"{DIFY_BASE_URL}/parameters",
            headers=headers,
            params={'user': 'default_user'}
        )
        print(f"Parameters response: {params_response.text}")  # デバッグ出力
        
        response = requests.post(
            WORKFLOW_ENDPOINT,
            headers=headers,
            json=payload
        )
        
        print(f"Response status: {response.status_code}")  # デバッグ出力
        print(f"Response body: {response.text}")  # デバッグ出力
        
        if response.status_code != 200:
            error_message = f"Error {response.status_code}: {response.text}"
            print(f"API Error: {error_message}")
            return jsonify({'error': error_message}), response.status_code
            
        response_data = response.json()
        
        # レスポンスからテキスト部分を抽出
        if 'data' in response_data and 'outputs' in response_data['data']:
            outputs = response_data['data']['outputs']
            
            if isinstance(outputs, dict):
                answer = outputs.get('output', '')
                if isinstance(answer, dict):
                    answer = next(iter(answer.values())) if answer else ''
                answer = str(answer).strip("'{}").replace("'", "")
            else:
                answer = str(outputs)
        else:
            answer = 'No response from workflow'
            
        return jsonify({'answer': answer})
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.debug = True
    print(f"Workflow Endpoint: {WORKFLOW_ENDPOINT}")
    print(f"API Key configured: {'Yes' if DIFY_API_KEY else 'No'}")
    app.run()