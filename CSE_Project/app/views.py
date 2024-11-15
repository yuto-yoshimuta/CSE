from typing import Tuple, Optional, List, Dict
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
import base64
import io
import pytz
import cv2
import numpy as np
import pandas as pd
import yfinance as yf
from roboflow import Roboflow
from matplotlib import pyplot as plt
import matplotlib.dates as mdates
import matplotlib
matplotlib.use('Agg')

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from .models import ExchangeRate

# Initialize logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Roboflow client
try:
    rf = Roboflow(api_key="4jFLZZIZSslfmqbOl4lq")
    project = rf.workspace().project("jpytwd")
    model = project.version(1).model
    logger.info("Roboflow model loaded successfully")
except Exception as e:
    logger.error(f"Failed to initialize Roboflow: {e}")
    raise

@dataclass
class ExchangeRateData:
    graph_data: str
    latest_rate: float
    last_updated: str

class ExchangeRateService:
    @staticmethod
    def get_exchange_rate_data() -> Optional[List[ExchangeRate]]:
        try:
            jst = pytz.timezone('Asia/Tokyo')
            end = datetime.now(jst).date()
            start = end - timedelta(days=365)
            currency_pair = 'TWDJPY'
            
            df = yf.download(f'{currency_pair}=X', start=start, end=end)
            if df.empty:
                return None
            
            ExchangeRate.objects.filter(
                currency_pair=currency_pair,
                date__gte=start
            ).delete()
            
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
                
            ExchangeRate.objects.bulk_create(bulk_create_list)
            
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
        try:
            plt.clf()
            plt.close('all')
            
            fig, ax = plt.subplots(figsize=(10, 5), dpi=100)
            jst = pytz.timezone('Asia/Tokyo')
            current_datetime = datetime.now(jst).strftime("%Y-%m-%d %H:%M:%S")
            
            dates = [rate.date for rate in rates]
            values = [float(rate.rate) if isinstance(rate.rate, pd.Series) else rate.rate 
                     for rate in rates]
            
            ax.plot(dates, values, label='TWD/JPY', color='#4CAF50', linewidth=2)
            ax.set_title('TWD/JPY Exchange Rate', fontsize=14, pad=20)
            ax.set_xlabel('Date', fontsize=12)
            ax.set_ylabel('Exchange Rate (TWD/JPY)', fontsize=12)
            ax.grid(True, linestyle='--', alpha=0.7)
            ax.legend(loc='upper right')
            
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
            plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
            plt.tight_layout()
            
            latest_rate = float(rates.last().rate.iloc[0] if isinstance(rates.last().rate, pd.Series)
                              else rates.last().rate)
            
            plt.figtext(0.05, 0.95, f'1 TWD = {latest_rate:.2f} JPY', 
                       fontsize=12, ha='left', va='top')
            plt.figtext(0.95, 0.02, f'Last updated: {current_datetime} (JST)', 
                       fontsize=10, ha='right')
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
            buffer.seek(0)
            graph = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return graph, latest_rate, current_datetime
        
        except Exception as e:
            logger.error(f"Error generating graph: {e}")
            return None, None, None
        
        finally:
            plt.close('all')
            if 'buffer' in locals():
                buffer.close()

def index(request):
    """Main view function for the homepage"""
    try:
        plt.clf()
        plt.close('all')
        
        rates = ExchangeRateService.get_exchange_rate_data()
        if not rates:
            context = {
                'error_message': 'Failed to fetch data.',
                'graph_data': None
            }
            return render(request, 'app/index.html', context)

        graph_data, latest_rate, last_updated = GraphService.generate_graph(rates)
        if not graph_data:
            context = {
                'error_message': 'Failed to generate graph.',
                'graph_data': None
            }
            return render(request, 'app/index.html', context)

        context = {
            'graph_data': graph_data,
            'latest_rate': latest_rate,
            'last_updated': last_updated,
            'error_message': None
        }
        
        return render(request, 'app/index.html', context)
    
    except Exception as e:
        logger.error(f"Error in index view: {e}")
        context = {
            'error_message': 'An unexpected error occurred.',
            'graph_data': None
        }
        return render(request, 'app/index.html', context)

@never_cache
def get_updated_graph(request):
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
    return render(request, 'app/image_recognition.html')

@csrf_exempt
def start_camera(request):
    try:
        logger.info("Camera access requested")
        return JsonResponse({"status": "success", "message": "Camera access granted"})
    except Exception as e:
        logger.error(f"Error in start_camera: {e}")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

@csrf_exempt
def video_feed(request, stream_id):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "GET method not supported"}, status=405)

    try:
        frame_data = request.body
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise ValueError("Invalid frame data")
        
        prediction_result = model.predict(frame, confidence=40, overlap=30).json()
        
        # 検出結果の処理
        processed_predictions = []
        for detection in prediction_result['predictions']:
            x = int(detection['x'] - detection['width'] / 2)
            y = int(detection['y'] - detection['height'] / 2)
            width = int(detection['width'])
            height = int(detection['height'])
            
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

def exchange_rate(request):
    return render(request, 'app/exchange_rate.html')

@require_http_methods(["POST"])
def convert_currency(request):
    try:
        amount = float(request.POST.get('amount'))
        from_currency = request.POST.get('from_currency')
        to_currency = request.POST.get('to_currency')
        
        if from_currency == to_currency:
            rate = 1.0
        else:
            ticker = f"{from_currency}{to_currency}=X"
            data = yf.download(ticker, period="1d")
            rate = float(data['Close'].iloc[-1])
        
        result = amount * rate
        
        return JsonResponse({
            'result': round(result, 2),
            'rate': round(rate, 4)
        })
    except Exception as e:
        logger.error(f"Error in currency conversion: {e}")
        return JsonResponse({'error': str(e)}, status=500)

def money(request):
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

def mitei(request):
    return render(request, 'app/mitei.html')