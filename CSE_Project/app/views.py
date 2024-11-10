from django.shortcuts import render
from django.core.cache import cache
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import yfinance as yf
import matplotlib.pyplot as plt
import io
import base64
from .models import ExchangeRate

#home
def get_exchange_rate_data():
    """為替レートデータを取得する関数"""
    # 日付範囲の設定
    end = datetime.now().date()
    start = end - timedelta(days=365)
    currency_pair = 'TWDJPY'
    
    # キャッシュからデータを確認
    cache_key = f'exchange_rate_data_{currency_pair}'
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data
    
    # データベースからデータを取得
    rates = ExchangeRate.objects.filter(
        currency_pair=currency_pair,
        date__gte=start
    ).order_by('date')
    
    # データが存在しない場合は新規取得
    if not rates.exists():
        try:
            df = yf.download(f'{currency_pair}=X', start=start, end=end)
            for index, row in df.iterrows():
                ExchangeRate.objects.create(
                    date=index.date(),
                    rate=float(row['Close']),
                    currency_pair=currency_pair
                )
            rates = ExchangeRate.objects.filter(
                currency_pair=currency_pair,
                date__gte=start
            ).order_by('date')
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    # キャッシュにデータを保存（1時間）
    cache.set(cache_key, rates, 3600)
    
    return rates

def generate_graph(rates):
    """グラフを生成してBase64エンコードされた文字列を返す関数"""
    try:
        plt.figure(figsize=(10, 5))
        plt.plot([rate.date for rate in rates], 
                [rate.rate for rate in rates], 
                label='TWD/JPY')
        plt.title('TWD/JPY Exchange Rate', fontsize=14)
        plt.xlabel('Date', fontsize=12)
        plt.ylabel('Exchange Rate (TWD/JPY)', fontsize=12)
        plt.grid(True)
        plt.legend()

        # 最新レートを表示
        latest_rate = rates.first().rate
        plt.figtext(0.05, 0.98, f'1 TWD = {latest_rate:.2f} JPY', 
                    fontsize=12, ha='left', va='top')

        # 更新日時を表示
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        plt.figtext(0.99, 0.01, f'Last updated: {current_datetime}', 
                    horizontalalignment='right')

        # グラフをBase64エンコード
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=300)
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close()

        graph = base64.b64encode(image_png).decode('utf-8')
        
        return graph, latest_rate, current_datetime
    
    except Exception as e:
        print(f"Error generating graph: {e}")
        return None, None, None

def index(request):
    """メインビュー関数"""
    try:
        # データ取得
        rates = get_exchange_rate_data()
        if rates is None:
            return render(request, 'app/index.html', {
                'error': 'データの取得に失敗しました。'
            })

        # グラフ生成
        graph_data, latest_rate, last_updated = generate_graph(rates)
        if graph_data is None:
            return render(request, 'app/index.html', {
                'error': 'グラフの生成に失敗しました。'
            })

        # コンテキストの作成
        context = {
            'graph_data': graph_data,
            'latest_rate': latest_rate,
            'last_updated': last_updated
        }
        
        return render(request, 'app/index.html', context)
    
    except Exception as e:
        print(f"Error in index view: {e}")
        return render(request, 'app/index.html', {
            'error': '予期せぬエラーが発生しました。'
        })
    
# 為替変換ページ
def exchange_rate(request):
    return render(request, 'app/exchange_rate.html')

@require_http_methods(["POST"])
def convert_currency(request):
    amount = float(request.POST.get('amount'))
    from_currency = request.POST.get('from_currency')
    to_currency = request.POST.get('to_currency')
    
    # 為替レートを取得
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

#お金説明ページ
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

def image_recognition(request):
    return render(request, 'app/image_recognition.html')