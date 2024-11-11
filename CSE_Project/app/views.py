import matplotlib.dates as mdates
import pytz
from matplotlib import pyplot as plt
import matplotlib
matplotlib.use('Agg')

from django.shortcuts import render
from django.core.cache import cache
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from roboflow import Roboflow
import cv2
import numpy as np
import pandas as pd
import yfinance as yf
import io
import base64
from .models import ExchangeRate
import logging
import json
from typing import Tuple, Optional, List, Dict
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Roboflow
try:
    rf = Roboflow(api_key="X6ALu0a2v4EeuHuJoa0V")
    project = rf.workspace().project("jpdtwd")
    model = project.version(3).model
    logger.info("Roboflow model loaded successfully")
except Exception as e:
    logger.error(f"Failed to initialize Roboflow: {e}")
    raise

@dataclass
class ExchangeRateData:
    """Data class for exchange rate information"""
    graph_data: str
    latest_rate: float
    last_updated: str

def get_exchange_rate_data() -> Optional[List[ExchangeRate]]:
    """
    Fetch exchange rate data with improved error handling
    """
    try:
        # JSTでの現在時刻を取得
        jst = pytz.timezone('Asia/Tokyo')
        end = datetime.now(jst).date()
        start = end - timedelta(days=365)
        currency_pair = 'TWDJPY'
        
        logger.debug(f"Fetching data for {currency_pair} from {start} to {end} (JST)")
        
        # yfinanceからデータ取得
        df = yf.download(f'{currency_pair}=X', start=start, end=end)
        
        if df.empty:
            logger.error("No data received from yfinance")
            return None
            
        logger.debug(f"Received {len(df)} records from yfinance")
        
        # 既存データのクリア
        ExchangeRate.objects.filter(
            currency_pair=currency_pair,
            date__gte=start
        ).delete()
        
        # 新しいレコードの作成
        bulk_create_list = []
        for index, row in df.iterrows():
            try:
                # Close価格の取得とfloatへの変換
                close_price = row['Close']
                if isinstance(close_price, pd.Series):
                    rate = float(close_price.iloc[0])
                else:
                    rate = float(close_price)
                
                # 日付の処理（タイムゾーン考慮）
                if isinstance(index, pd.Timestamp):
                    if index.tz is None:
                        date = index.tz_localize('UTC').tz_convert('Asia/Tokyo').date()
                    else:
                        date = index.tz_convert('Asia/Tokyo').date()
                else:
                    date = index.date()
                
                bulk_create_list.append(
                    ExchangeRate(
                        date=date,
                        rate=rate,
                        currency_pair=currency_pair
                    )
                )
                logger.debug(f"Processed data for {date}: {rate}")
                
            except Exception as e:
                logger.error(f"Error processing row {index}: {e}")
                continue
        
        if not bulk_create_list:
            logger.error("No valid data to save")
            return None
            
        # バルク作成
        ExchangeRate.objects.bulk_create(bulk_create_list)
        logger.debug(f"Created {len(bulk_create_list)} new records")
        
        # データ取得（日付でソート）
        rates = ExchangeRate.objects.filter(
            currency_pair=currency_pair,
            date__gte=start
        ).order_by('date')
        
        return rates if rates.exists() else None
        
    except Exception as e:
        logger.error(f"Error in get_exchange_rate_data: {e}", exc_info=True)
        return None

@never_cache  # このデコレータでキャッシュを無効化
def get_updated_graph(request):
    """グラフデータを更新するためのエンドポイント"""
    try:
        rates = get_exchange_rate_data()
        if rates is None:
            return JsonResponse({'error': 'Failed to fetch data'}, status=400)

        graph_data, latest_rate, last_updated = generate_graph(rates)
        if graph_data is None:
            return JsonResponse({'error': 'Failed to generate graph'}, status=400)

        return JsonResponse({
            'graph_data': graph_data,
            'latest_rate': latest_rate,
            'last_updated': last_updated
        })
    except Exception as e:
        logger.error(f"Error updating graph: {e}")
        return JsonResponse({'error': str(e)}, status=500)

def generate_graph(rates: List[ExchangeRate]) -> Tuple[Optional[str], Optional[float], Optional[str]]:
    """
    Generate graph from exchange rate data with improved error handling and font settings
    """
    try:
        # Clear any existing plots
        plt.clf()
        plt.close('all')
        
        # Create new figure with specific DPI
        fig, ax = plt.subplots(figsize=(10, 5), dpi=100)
        
        # Get current time in JST
        jst = pytz.timezone('Asia/Tokyo')
        current_datetime = datetime.now(jst).strftime("%Y-%m-%d %H:%M:%S")
        
        # Prepare data
        dates = [rate.date for rate in rates]
        values = [float(rate.rate) if isinstance(rate.rate, pd.Series) else rate.rate for rate in rates]
        
        # Plot data
        ax.plot(dates, values, label='TWD/JPY', color='#4CAF50', linewidth=2)
        
        # Configure plot
        ax.set_title('TWD/JPY Exchange Rate', fontsize=14, pad=20)
        ax.set_xlabel('Date', fontsize=12)
        ax.set_ylabel('Exchange Rate (TWD/JPY)', fontsize=12)
        ax.grid(True, linestyle='--', alpha=0.7)
        ax.legend(loc='upper right')

        # Format x-axis dates
        date_formatter = mdates.DateFormatter('%Y-%m-%d')
        ax.xaxis.set_major_formatter(date_formatter)
        
        # Rotate and align the tick labels so they look better
        plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
        
        # Use a tight layout
        plt.tight_layout()

        # Get latest rate
        try:
            latest_rate = rates.last().rate
            if isinstance(latest_rate, pd.Series):
                latest_rate = float(latest_rate.iloc[0])
            else:
                latest_rate = float(latest_rate)
        except (AttributeError, IndexError) as e:
            logger.error(f"Error getting latest rate: {e}")
            latest_rate = 0.0

        # Add rate and timestamp
        plt.figtext(0.05, 0.95, f'1 TWD = {latest_rate:.2f} JPY', 
                   fontsize=12, ha='left', va='top')
        plt.figtext(0.95, 0.02, f'Last updated: {current_datetime} (JST)', 
                   fontsize=10, ha='right')

        # Save to buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
        buffer.seek(0)
        graph = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return graph, latest_rate, current_datetime
    
    except Exception as e:
        logger.error(f"Error generating graph: {e}")
        return None, None, None
    
    finally:
        if 'fig' in locals():
            plt.close(fig)
        if 'buffer' in locals():
            buffer.close()

def index(request):
    """Main view function for the homepage"""
    try:
        # matplotlib のキャッシュをクリア
        plt.clf()
        plt.close('all')
        
        # データ取得
        rates = get_exchange_rate_data()
        if not rates:
            logger.error("No exchange rate data available")
            context = {
                'error_message': 'データを取得できませんでした。',
                'graph_data': None
            }
            return render(request, 'app/index.html', context)

        # グラフ生成
        graph_data, latest_rate, last_updated = generate_graph(rates)
        if not graph_data:
            logger.error("Failed to generate graph")
            context = {
                'error_message': 'グラフの生成に失敗しました。',
                'graph_data': None
            }
            return render(request, 'app/index.html', context)

        # 正常な場合のコンテキスト
        context = {
            'graph_data': graph_data,
            'latest_rate': latest_rate,
            'last_updated': last_updated,
            'error_message': None
        }
        
        logger.info("Successfully generated graph data")
        return render(request, 'app/index.html', context)
    
    except Exception as e:
        logger.error(f"Error in index view: {e}")
        context = {
            'error_message': '予期せぬエラーが発生しました。',
            'graph_data': None
        }
        return render(request, 'app/index.html', context)

# Currency conversion page views
def exchange_rate(request):
    """Render exchange rate converter page"""
    return render(request, 'app/exchange_rate.html')

@require_http_methods(["POST"])
def convert_currency(request) -> JsonResponse:
    """
    Convert currency based on current exchange rates
    
    Returns:
        JsonResponse: Conversion result and rate
    """
    amount = float(request.POST.get('amount'))
    from_currency = request.POST.get('from_currency')
    to_currency = request.POST.get('to_currency')
    
    if from_currency != to_currency:
        ticker = f"{from_currency}{to_currency}=X"
        data = yf.download(ticker, period="1d")
        rate = float(data['Close'].iloc[-1])
    else:
        rate = 1.0
    
    result = amount * rate
    
    return JsonResponse({
        'result': round(result, 2),
        'rate': round(rate, 4)
    })

# Currency information page
CURRENCY_TYPES = {
    'JPY': {
        'denominations': [1, 5, 10, 50, 100, 500, 1000, 5000, 10000],
        'button_id': 'yellow'
    },
    'TWD': {
        'denominations': [1, 5, 10, 50, 100, 500, 1000],
        'button_id': 'blue'
    }
}

def money(request):
    """Render currency information page"""
    return render(request, 'app/money.html', {'currency_types': CURRENCY_TYPES})

# Money recognition views
@csrf_exempt
def image_recognition(request):
    """Render image recognition page"""
    return render(request, 'app/image_recognition.html')

@csrf_exempt
def start_camera(request):
    """Initialize camera access"""
    try:
        logger.info("Camera access requested")
        return JsonResponse({"status": "success", "message": "Camera access granted"})
    except Exception as e:
        logger.error(f"Error in start_camera: {e}")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

@csrf_exempt
def video_feed(request, stream_id):
    """
    Process video feed for money recognition
    
    Args:
        stream_id: Identifier for the video stream
    """
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "GET method not supported"}, status=405)

    try:
        frame_data = request.body
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise ValueError("Invalid frame data")
        
        # Process frame with Roboflow
        prediction_result = model.predict(frame, confidence=40, overlap=30).json()
        processed_predictions = process_predictions(frame, prediction_result)
        
        # Encode processed frame
        _, buffer = cv2.imencode('.jpg', frame)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return JsonResponse({
            "status": "success",
            "predictions": processed_predictions,
            "image": image_base64
        })
        
    except Exception as e:
        logger.error(f"Error processing frame: {e}", exc_info=True)
        return JsonResponse({
            "status": "error",
            "message": str(e),
            "type": "processing_error"
        }, status=500)

def process_predictions(frame, prediction_result):
    """Process and visualize predictions on the frame"""
    processed_predictions = []
    for detection in prediction_result['predictions']:
        x = int(detection['x'] - detection['width'] / 2)
        y = int(detection['y'] - detection['height'] / 2)
        width = int(detection['width'])
        height = int(detection['height'])
        
        # Draw bounding box and label
        cv2.rectangle(frame, (x, y), (x + width, y + height), (0, 255, 0), 2)
        cv2.putText(frame, 
                   f"{detection['class']} ({detection['confidence']:.2f})", 
                   (x, y - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 
                   0.5, (0, 255, 0), 2)
        
        processed_predictions.append({
            "class": detection['class'],
            "confidence": detection['confidence'],
            "x": x,
            "y": y,
            "width": width,
            "height": height
        })
    
    return processed_predictions

# AI chat feature
def mitei(request):
    """Render AI chat page"""
    return render(request, 'app/mitei.html')