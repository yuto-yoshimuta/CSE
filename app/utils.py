import os
import requests
import logging
from django.conf import settings

# Initialize logger for this module
logger = logging.getLogger(__name__)

class DifyAPI:
    """
    Client for interacting with the Dify AI API.
    Handles authentication and message sending functionality.
    """
    
    def __init__(self):
        """
        Initialize the Dify API client with credentials and base configuration.
        Gets API key and app ID from Django settings.
        """
        self.api_key = settings.DIFY_API_KEY
        self.app_id = settings.DIFY_APP_ID
        self.base_url = "https://api.dify.ai/v1"
        
        # Set up authentication headers for API requests
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

    def send_message(self, query, conversation_id=None, user="default_user", stream=True):
        """
        Send a message to the Dify API and get the response.
        
        Args:
            query (str): The message to send to the AI
            conversation_id (str, optional): ID to maintain conversation context
            user (str, optional): User identifier, defaults to "default_user"
            stream (bool, optional): Whether to stream the response, defaults to True
        
        Returns:
            requests.Response: The API response object
            
        Raises:
            requests.exceptions.RequestException: If the API request fails
        """
        endpoint = f"{self.base_url}/chat-messages"

        # Prepare the request payload
        payload = {
            "inputs": {},
            "query": query,
            "response_mode": "streaming" if stream else "blocking",
            "conversation_id": conversation_id,
            "user": user
        }

        logger.info(f"Sending request with payload: {payload}")

        try:
            # Send POST request to Dify API
            response = requests.post(
                endpoint,
                headers=self.headers,
                json=payload,
                stream=stream
            )
            
            # Check for HTTP errors
            response.raise_for_status()
            return response
            
        except requests.exceptions.RequestException as e:
            # Log detailed error information
            logger.error(f"Dify API Error: {str(e)}")
            if hasattr(e.response, 'text'):
                logger.error(f"Error response: {e.response.text}")
            raise