from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む
load_dotenv()

app = Flask(__name__)

# DifyのAPI設定
DIFY_API_KEY = os.getenv('DIFY_API_KEY')
DIFY_API_ENDPOINT = os.getenv('DIFY_API_ENDPOINT')  # 例: "https://api.dify.ai/v1/chat-messages"

headers = {
    'Authorization': f'Bearer {DIFY_API_KEY}',
    'Content-Type': 'application/json'
}

# HTMLテンプレート用のルート
@app.route('/')
def home():
    return render_template('index.html')

# Dify APIにリクエストを送信するエンドポイント
@app.route('/ask', methods=['POST'])
def ask():
    user_input = request.json.get('message')
    
    # Dify APIにリクエストを送信
    payload = {
        'query': user_input,
        'response_mode': 'streaming',
        'conversation_id': None  # 新しい会話として扱う
    }
    
    try:
        response = requests.post(
            DIFY_API_ENDPOINT,
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)