from typing import Tuple, Optional, List, Dict
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
import base64
import io
import pytz
import cv2
import json
import numpy as np
import pandas as pd
import yfinance as yf
from roboflow import Roboflow
from matplotlib import pyplot as plt
import matplotlib.dates as mdates
import matplotlib
matplotlib.use('Agg')

from django.shortcuts import render
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from .utils import DifyAPI
from .models import ExchangeRate

# Initialize the DifyAPI for AI chat functionality
dify_api = DifyAPI()

# Set up logging to track errors and debug information
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Roboflow for image recognition
# This service is used to detect and classify objects in images
try:
    rf = Roboflow(api_key="4jFLZZIZSslfmqbOl4lq")
    project = rf.workspace().project("jpytwd")
    model = project.version(1).model
    logger.info("Roboflow model loaded successfully")
except Exception as e:
    logger.error(f"Failed to initialize Roboflow: {e}")
    raise

# Define a data class to store exchange rate information
@dataclass
class ExchangeRateData:
    graph_data: str          # Base64 encoded graph image
    latest_rate: float       # Most recent exchange rate
    last_updated: str        # Timestamp of last update

class ExchangeRateService:
    @staticmethod
    def get_exchange_rate_data() -> Optional[List[ExchangeRate]]:
        """
        Fetches one year of TWD/JPY exchange rate data from Yahoo Finance
        and stores it in the database.
        Returns a list of ExchangeRate objects or None if the fetch fails.
        """
        try:
            # Set up date range for the past year in Japan timezone
            jst = pytz.timezone('Asia/Tokyo')
            end = datetime.now(jst).date()
            start = end - timedelta(days=365)
            currency_pair = 'TWDJPY'
            
            # Download exchange rate data from Yahoo Finance
            df = yf.download(f'{currency_pair}=X', start=start, end=end)
            if df.empty:
                return None
            
            # Clear existing data for this date range
            ExchangeRate.objects.filter(
                currency_pair=currency_pair,
                date__gte=start
            ).delete()
            
            # Convert the downloaded data into ExchangeRate objects
            bulk_create_list = [
                ExchangeRate(
                    date=index.tz_localize('UTC').tz_convert('Asia/Tokyo').date() 
                        if isinstance(index, pd.Timestamp) and index.tz is None 
                        else index.tz_convert('Asia/Tokyo').date() 
                        if isinstance(index, pd.Timestamp) 
                        else index.date(),
                    rate=float(row['Close'].iloc[0]) if isinstance(row['Close'], pd.Series) 
                        else float(row['Close']),
                    currency_pair=currency_pair
                )
                for index, row in df.iterrows()
            ]
            
            if not bulk_create_list:
                return None
                
            # Save all exchange rates to database at once
            ExchangeRate.objects.bulk_create(bulk_create_list)
            
            # Return the saved exchange rates ordered by date
            return ExchangeRate.objects.filter(
                currency_pair=currency_pair,
                date__gte=start
            ).order_by('date')
            
        except Exception as e:
            logger.error(f"Error in get_exchange_rate_data: {e}", exc_info=True)
            return None

class GraphService:
    @staticmethod
    def generate_graph(rates: List[ExchangeRate]) -> Tuple[Optional[str], Optional[float], Optional[str]]:
        """
        Generates a graph of exchange rates using matplotlib.
        Returns a tuple of (base64 encoded graph image, latest rate, timestamp).
        """
        try:
            # Clear any existing plots
            plt.clf()
            plt.close('all')
            
            # Create new figure and axis for the graph
            fig, ax = plt.subplots(figsize=(10, 5), dpi=100)
            jst = pytz.timezone('Asia/Taipei')
            current_datetime = datetime.now(jst).strftime("%Y-%m-%d %H:%M:%S")
            
            # Extract dates and rates from the data
            dates = [rate.date for rate in rates]
            values = [float(rate.rate) if isinstance(rate.rate, pd.Series) else rate.rate 
                     for rate in rates]
            
            # Plot the exchange rate data
            ax.plot(dates, values, label='TWD/JPY', color='#4CAF50', linewidth=2)
            ax.set_title('TWD/JPY Exchange Rate', fontsize=14, pad=20)
            ax.set_xlabel('Date', fontsize=12)
            ax.set_ylabel('Exchange Rate (TWD/JPY)', fontsize=12)
            ax.grid(True, linestyle='--', alpha=0.7)
            ax.legend(loc='upper right')
            
            # Format the x-axis dates
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
            plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
            plt.tight_layout()
            
            # Get the latest exchange rate
            latest_rate = float(rates.last().rate.iloc[0] if isinstance(rates.last().rate, pd.Series)
                              else rates.last().rate)
            
            # Add text annotations to the graph
            plt.figtext(0.05, 0.95, f'1 TWD = {latest_rate:.2f} JPY', 
                       fontsize=12, ha='left', va='top')
            plt.figtext(0.95, 0.02, f'Last updated: {current_datetime} (TST)', 
                       fontsize=10, ha='right')
            
            # Convert the graph to a base64 encoded string
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
            buffer.seek(0)
            graph = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return graph, latest_rate, current_datetime
        
        except Exception as e:
            logger.error(f"Error generating graph: {e}")
            return None, None, None
        
        finally:
            # Clean up matplotlib resources
            plt.close('all')
            if 'buffer' in locals():
                buffer.close()

def home(request):
    """
    Main view function for the homepage.
    Displays the exchange rate graph and latest rate.
    """
    try:
        plt.clf()
        plt.close('all')
        
        # Get exchange rate data
        rates = ExchangeRateService.get_exchange_rate_data()
        if not rates:
            context = {
                'error_message': 'Failed to fetch data.',
                'graph_data': None
            }
            return render(request, 'app/home.html', context)

        # Generate the graph
        graph_data, latest_rate, last_updated = GraphService.generate_graph(rates)
        if not graph_data:
            context = {
                'error_message': 'Failed to generate graph.',
                'graph_data': None
            }
            return render(request, 'app/home.html', context)

        # Prepare data for the template
        context = {
            'graph_data': graph_data,
            'latest_rate': latest_rate,
            'last_updated': last_updated,
            'error_message': None
        }
        
        return render(request, 'app/home.html', context)
    
    except Exception as e:
        logger.error(f"Error in home view: {e}")
        context = {
            'error_message': 'An unexpected error occurred.',
            'graph_data': None
        }
        return render(request, 'app/home.html', context)

@never_cache
def get_updated_graph(request):
    """
    AJAX endpoint to update the exchange rate graph without reloading the page.
    Returns JSON containing the new graph data, latest rate, and timestamp.
    """
    try:
        rates = ExchangeRateService.get_exchange_rate_data()
        if not rates:
            return JsonResponse({'error': 'Failed to fetch data'}, status=400)

        graph_data, latest_rate, last_updated = GraphService.generate_graph(rates)
        if not graph_data:
            return JsonResponse({'error': 'Failed to generate graph'}, status=400)

        return JsonResponse({
            'graph_data': graph_data,
            'latest_rate': latest_rate,
            'last_updated': last_updated
        })
    except Exception as e:
        logger.error(f"Error updating graph: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def image_recognition(request):
    """
    View for the image recognition page.
    CSRF exempt to allow image uploads from the frontend.
    """
    return render(request, 'app/image_recognition.html')

@csrf_exempt
def start_camera(request):
    """
    Endpoint to initialize camera access for image recognition.
    Returns success/error status to the frontend.
    """
    try:
        logger.info("Camera access requested")
        return JsonResponse({"status": "success", "message": "Camera access granted"})
    except Exception as e:
        logger.error(f"Error in start_camera: {e}")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

@csrf_exempt
def video_feed(request, stream_id):
    """
    Process video frames for object detection.
    Takes a frame from the frontend, runs object detection, and returns the results.
    """
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "GET method not supported"}, status=405)

    try:
        # Convert incoming frame data to OpenCV format
        frame_data = request.body
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise ValueError("Invalid frame data")
        
        # Run object detection on the frame
        prediction_result = model.predict(frame, confidence=40, overlap=30).json()
        
        # Debug log for predictions
        logger.debug(f"Raw predictions: {prediction_result}")
        
        # Process and visualize detection results
        processed_predictions = []
        for detection in prediction_result['predictions']:
            # Extract class name and confidence
            class_name = detection['class']
            confidence = detection['confidence']
            
            # Calculate bounding box coordinates
            x = int(detection['x'] - detection['width'] / 2)
            y = int(detection['y'] - detection['height'] / 2)
            width = int(detection['width'])
            height = int(detection['height'])
            
            # Draw rectangle and label on the frame
            cv2.rectangle(frame, (x, y), (x + width, y + height), (0, 255, 0), 2)
            label_text = f"{class_name} ({confidence:.2f})"
            cv2.putText(frame, 
                       label_text, 
                       (x, y - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 
                       0.5, (0, 255, 0), 2)
            
            # Clean and normalize the class name
            # TWD format standardization
            if isinstance(class_name, str):
                if 'twd' in class_name.lower():
                    # Extract the number and ensure proper format
                    try:
                        # Remove any negative signs from the class name if present
                        class_name = class_name.replace('-', '')
                        # Standardize format to "twd_X" where X is the number
                        if '_' not in class_name:
                            number = ''.join(filter(str.isdigit, class_name))
                            class_name = f"twd_{number}"
                    except Exception as e:
                        logger.error(f"Error processing TWD class name: {e}")
            
            # Store detection results
            processed_prediction = {
                "class": class_name,
                "confidence": confidence,
                "x": x,
                "y": y,
                "width": width,
                "height": height
            }
            processed_predictions.append(processed_prediction)
            
            # Debug log for each processed prediction
            logger.debug(f"Processed prediction: {processed_prediction}")
        
        # Convert processed frame to base64 for sending to frontend
        _, buffer = cv2.imencode('.jpg', frame)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        response_data = {
            "status": "success",
            "predictions": processed_predictions,
            "image": image_base64
        }
        
        # Debug log for final response
        logger.debug(f"Sending response with predictions: {processed_predictions}")
        
        return JsonResponse(response_data)
        
    except Exception as e:
        logger.error(f"Error processing frame: {e}", exc_info=True)
        return JsonResponse({
            "status": "error",
            "message": str(e),
            "type": "processing_error"
        }, status=500)

def exchange_rate(request):
    """
    View for the exchange rate calculator page.
    """
    return render(request, 'app/exchange_rate.html')

@require_http_methods(["POST"])
def convert_currency(request):
    """
    Currency conversion endpoint that handles POST requests
    Parameters:
        amount: float - Amount to convert
        from_currency: str - Source currency code
        to_currency: str - Target currency code
    Returns:
        JsonResponse with converted amount, exchange rate and formatted strings
    """
    try:
        # Validate if all required parameters exist in the request
        if not all(key in request.POST for key in ['amount', 'from_currency', 'to_currency']):
            return JsonResponse({
                'error': 'Missing required parameters'
            }, status=400)

        # Convert and validate input parameters
        try:
            amount = float(request.POST.get('amount'))
            from_currency = request.POST.get('from_currency')
            to_currency = request.POST.get('to_currency')
        except ValueError:
            return JsonResponse({
                'error': 'Invalid amount format'
            }, status=400)

        # Check if amount is positive
        if amount <= 0:
            return JsonResponse({
                'error': 'Amount must be greater than 0'
            }, status=400)

        logger.info(f"Converting {amount} {from_currency} to {to_currency}")

        # If converting same currency, return original amount with rate of 1
        if from_currency == to_currency:
            current_time = datetime.now(pytz.timezone('Asia/Taipei')).strftime("%Y-%m-%d %H:%M:%S")
            return JsonResponse({
                'result': amount,
                'rate': 1.0,
                'formatted_result': f"{amount:,.2f} {to_currency}",
                'formatted_rate': f"1 {from_currency} = 1.0000 {to_currency}",
                'conversion_time': current_time
            })

        # Get exchange rate from Yahoo Finance API
        try:
            ticker = f"{from_currency}{to_currency}=X"
            df = yf.download(ticker, period="1d")
            
            if df.empty:
                return JsonResponse({
                    'error': 'Failed to fetch exchange rate'
                }, status=400)

            # Calculate converted amount using latest exchange rate
            current_rate = float(df['Close'].iloc[-1])
            result = amount * current_rate
            
            # Get current time in Taipei timezone
            current_time = datetime.now(pytz.timezone('Asia/Taipei')).strftime("%Y-%m-%d %H:%M:%S")

            return JsonResponse({
                'result': round(result, 2),
                'rate': round(current_rate, 4),
                'formatted_result': f"{amount:,.2f} {from_currency} = {result:,.2f} {to_currency}",
                'formatted_rate': f"1 {from_currency} = {current_rate:.4f} {to_currency}",
                'conversion_time': current_time
            })

        except Exception as e:
            logger.error(f"Yahoo Finance error: {str(e)}")
            return JsonResponse({
                'error': 'Failed to fetch exchange rate'
            }, status=400)

    except Exception as e:
        logger.error(f"Conversion error: {str(e)}")
        return JsonResponse({
            'error': 'An unexpected error occurred'
        }, status=500)

def get_exchange_rates(request):
    try:
        currency_pairs = ['TWDJPY=X', 'JPYTWD=X']
        rates = {}
        
        for pair in currency_pairs:
            data = yf.download(pair, period='1d')
            if not data.empty:
                rates[pair.replace('=X', '')] = float(data['Close'].iloc[-1])

        if not rates:
            return JsonResponse({'error': 'Failed to fetch exchange rates'}, status=400)

        # Get current time in Taiwan timezone
        tst = pytz.timezone('Asia/Taipei')
        current_time = datetime.now(tst).strftime("%Y-%m-%d %H:%M:%S")

        response_data = {
            'rates': {
                'JPY_TWD': rates.get('JPYTWD', 0),
                'TWD_JPY': rates.get('TWDJPY', 0)
            },
            'last_updated': current_time
        }

        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Error fetching exchange rates: {str(e)}")
        return JsonResponse({
            'error': 'Failed to fetch exchange rates',
            'details': str(e)
        }, status=500)

def money(request):
    """
    View for displaying currency denominations page.
    Contains lists of available denominations for JPY and TWD.
    """
    currency_types = {
        'JPY': {
            'denominations': [1, 5, 10, 50, 100, 500, 1000, 5000, 10000],
            'button_id': 'yellow'
        },
        'TWD': {
            'denominations': [1, 5, 10, 50, 100, 500, 1000],
            'button_id': 'blue'
        }
    }
    return render(request, 'app/money.html', {'currency_types': currency_types})

def financing_ai_chat(request):
    """
    View for AI chat interface focused on financial topics.
    Provides initial welcome message and example questions.
    """
    context = {
        'initial_message': (
            "Hello! I'm Financing AI Chat 💬✨!\n"
            "Feel free to enter your concerns or matters you wish to investigate.\n\n"
            "What I can do:\n"
            "- Analyze specific stocks (U.S. listed stocks)\n"
            "- Provide financial knowledge and literacy\n"
            "- Diagnosis of investment style\n"
            "- Chatting with you\n\n"
            "Sample Questions:\n"
            "- I would like to know if TSMC's share price was undervalued in 2020.\n"
            "- I want to know which investment method is right for me.\n"
            "- What is the difference between assets and liabilities?"
        )
    }
    return render(request, 'app/financing_ai_chat.html', context)

@require_http_methods(["POST"])
def ask(request):
    """
    AI Chat endpoint that handles POST requests for message processing.
    Takes user message and returns AI response as a stream.
    """
    try:
        # Parse JSON request body
        data = json.loads(request.body)
        user_message = data.get('message')
        conversation_id = data.get('conversation_id')
        user_id = data.get('user', 'default_user')

        # Validate message exists
        if not user_message:
            logger.error("No message provided in request")
            return JsonResponse({'error': 'No message provided'}, status=400)

        logger.info(f"Processing message from user {user_id}: {user_message[:50]}...")

        try:
            # Send message to Dify API and get streaming response
            response = dify_api.send_message(
                query=user_message,
                conversation_id=conversation_id,
                user=user_id,
                stream=True
            )

            def generate():
                """Generator function to stream API response"""
                try:
                    for line in response.iter_lines():
                        if line:
                            decoded_line = line.decode('utf-8')
                            logger.debug(f"Streaming response line: {decoded_line[:50]}...")
                            yield f"data: {decoded_line}\n\n"
                except Exception as e:
                    logger.error(f"Error in stream generation: {e}")
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"

            return StreamingHttpResponse(
                generate(),
                content_type='text/event-stream'
            )

        except Exception as e:
            logger.error(f"Error in Dify API communication: {e}")
            return JsonResponse({
                'error': 'Failed to communicate with AI service',
                'details': str(e)
            }, status=503)

    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in request: {e}")
        return JsonResponse({
            'error': 'Invalid JSON format',
            'details': str(e)
        }, status=400)
    
    except Exception as e:
        logger.error(f"Unexpected error in ask endpoint: {e}")
        return JsonResponse({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }, status=500)

def reference(request):
    return render(request, 'app/reference.html')

def get_exchange_rates(request):
    """
    Get current exchange rates for multiple currency pairs
    Returns:
        JsonResponse with current rates and timestamp
    """
    try:
        # Download rates for multiple currency pairs
        currency_pairs = ['TWDJPY=X', 'JPYTWD=X', 'USDJPY=X', 'USDTWD=X']
        rates = {}
        
        for pair in currency_pairs:
            data = yf.download(pair, period='1d')
            if not data.empty:
                rates[pair.replace('=X', '')] = float(data['Close'].iloc[-1])

        if not rates:
            return JsonResponse({'error': 'Failed to fetch exchange rates'}, status=400)

        # Get current time in Taiwan timezone
        tst = pytz.timezone('Asia/Taipei')
        current_time = datetime.now(tst).strftime("%Y-%m-%d %H:%M:%S")

        response_data = {
            'rates': {
                'JPY_TWD': rates.get('JPYTWD', 0),
                'TWD_JPY': rates.get('TWDJPY', 0),
                'USD_JPY': rates.get('USDJPY', 0),
                'USD_TWD': rates.get('USDTWD', 0)
            },
            'last_updated': current_time
        }

        logger.info(f"Exchange rates fetched successfully: {response_data}")
        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Error fetching exchange rates: {str(e)}")
        return JsonResponse({
            'error': 'Failed to fetch exchange rates',
            'details': str(e)
        }, status=500)