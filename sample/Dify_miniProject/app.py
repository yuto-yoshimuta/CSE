from flask import Flask, render_template, request, jsonify, session
import requests
import os
from dotenv import load_dotenv
import logging
from flask_cors import CORS
import uuid

# 環境変数の読み込み
load_dotenv()

class DifyAPI:
    def __init__(self):
        self.api_key = os.getenv('DIFY_API_KEY')
        self.app_id = os.getenv('DIFY_APP_ID')
        self.base_url = "https://api.dify.ai/v1"
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

    def send_message(self, query, conversation_id=None, user="default_user", stream=True):
        """メッセージを送信してレスポンスを取得"""
        endpoint = f"{self.base_url}/chat-messages"

        payload = {
            "inputs": {},
            "query": query,
            "response_mode": "streaming" if stream else "blocking",
            "conversation_id": conversation_id,
            "user": user
        }

        app.logger.info(f"Sending request with payload: {payload}")

        try:
            response = requests.post(
                endpoint,
                headers=self.headers,
                json=payload,
                stream=stream
            )
            
            response.raise_for_status()
            # 会話IDを抽出（最初のメッセージの場合）
            if not conversation_id and not stream:
                conversation_id = response.json().get('conversation_id')
                app.logger.info(f"Created new conversation: {conversation_id}")
            
            return response
            
        except requests.exceptions.RequestException as e:
            app.logger.error(f"Dify API Error: {str(e)}")
            if hasattr(e.response, 'text'):
                app.logger.error(f"Error response: {e.response.text}")
            raise

# Flaskアプリケーションの設定
app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')

# ログ設定 - 標準出力に出力
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    handlers=[logging.StreamHandler()]
)

dify_api = DifyAPI()

@app.route('/')
def home():
    try:
        return render_template('index.html')
    except Exception as e:
        app.logger.error(f"Error rendering template: {str(e)}")
        return "An error occurred while loading the page", 500

@app.route('/ask', methods=['POST'])
def ask():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400

        user_message = data['message']
        conversation_id = data.get('conversation_id')
        user_id = data.get('user', 'default_user')

        app.logger.info(f"Received message request: {user_message}")
        app.logger.info(f"Conversation ID: {conversation_id}")
        app.logger.info(f"User ID: {user_id}")

        response = dify_api.send_message(
            query=user_message,
            conversation_id=conversation_id,
            user=user_id,
            stream=True
        )

        def generate():
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    app.logger.info(f"Streaming response line: {decoded_line}")
                    yield f"data: {decoded_line}\n\n"

        return app.response_class(
            generate(),
            mimetype='text/event-stream'
        )

    except Exception as e:
        app.logger.error(f"Error in ask endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=debug_mode
    )