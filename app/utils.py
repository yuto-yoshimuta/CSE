import os
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class DifyAPI:
    def __init__(self):
        self.api_key = settings.DIFY_API_KEY
        self.app_id = settings.DIFY_APP_ID
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

        logger.info(f"Sending request with payload: {payload}")

        try:
            response = requests.post(
                endpoint,
                headers=self.headers,
                json=payload,
                stream=stream
            )
            
            response.raise_for_status()
            return response
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Dify API Error: {str(e)}")
            if hasattr(e.response, 'text'):
                logger.error(f"Error response: {e.response.text}")
            raise