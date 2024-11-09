import datetime
from matplotlib import pyplot as plt
import yfinance as yf
import webbrowser
import os
from bs4 import BeautifulSoup

def get_exchange_rate(currency_pair, start, end):
    ticker = f'{currency_pair}=X'
    df = yf.download(ticker, start=start, end=end).drop(['Volume', 'Adj Close'], axis=1)
    return df

# 日付設定
end = datetime.date.today()
start = end - datetime.timedelta(days=365)

# 最新の為替レートデータを取得
twd_jpy = get_exchange_rate('TWDJPY', start, end)

# データをプロットする関数
def plot_data(data, image_path="output.png"):
    plt.figure(figsize=(10, 5))
    plt.plot(data['Close'], label='TWD/JPY')  # レートのラベルを追加
    plt.title('TWD/JPY Exchange Rate', fontsize=14)  # タイトルを指定
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Exchange Rate (TWD/JPY)', fontsize=12)  # y軸ラベルを明確に
    plt.grid(True)  # グリッドを表示
    plt.legend()  # 凡例を表示

    # 1 TWDが何円であるかを表示
    latest_rate = data['Close'].iloc[-1].item()  # 最後の為替レートをスカラーとして取得
    plt.figtext(0.05, 0.98, f'1 TWD = {latest_rate:.2f} JPY', fontsize=12, ha='left', va='top')  # 左上に表示

    # 現在の日時を追加
    current_datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    plt.figtext(0.99, 0.01, f'Last updated: {current_datetime}', horizontalalignment='right')

    plt.tight_layout()
    plt.savefig(image_path)
    plt.close()

# HTMLを更新する関数
def update_html(image_path, template_path, output_path):
    with open(template_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')

    # グラフを表示する要素を検索
    graph_space_div = soup.find('div', class_='graph-space')

    if graph_space_div:
        img_tag = soup.new_tag('img', src=image_path, alt="Exchange Rate Plot", border="5")
        img_tag['style'] = "max-width: 100%; height: auto;" 
        graph_space_div.clear()
        graph_space_div.append(img_tag)

    # 日時を更新
    date_space_div = soup.find('div', class_='date-space')
    if date_space_div:
        date_space_div.string = f"Last updated: {current_datetime}"

    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(str(soup))

    return output_path

# ブラウザでHTMLを開く関数
def open_in_browser(html_path):
    webbrowser.open('file://' + os.path.realpath(html_path))

# ディレクトリ作成
html_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
if not os.path.exists(html_dir):
    os.makedirs(html_dir)

# 画像とHTMLのパス設定
image_path = os.path.join(html_dir, "output.png")
script_dir = os.path.dirname(os.path.abspath(__file__))
template_path = os.path.join(script_dir, "index.html")
output_path = os.path.join(script_dir, "index.html")

# 最新の為替レートデータを取得し、プロットを生成
plot_data(twd_jpy, image_path=image_path)

# HTMLを更新
update_html(image_path, template_path, output_path)

# ブラウザでHTMLを開く
open_in_browser(output_path)
