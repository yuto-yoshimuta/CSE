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

end = datetime.date.today()
start = end - datetime.timedelta(days=365)

usd_jpy = get_exchange_rate('TWDJPY', start, end)

def plot_data(data, title="Exchange rate", image_path="output.png"):
    plt.figure(figsize=(10, 5))
    plt.plot(data['Close'])
    plt.title(title)
    plt.xlabel('Date')
    plt.ylabel('Exchange Rate')
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(image_path)
    plt.close()

def update_html(image_path, template_path, output_path):
    with open(template_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')

    
    graph_space_div = soup.find('div', class_='graph-space')

    if graph_space_div:
  
        img_tag = soup.new_tag('img', src=image_path, alt="Exchange Rate Plot", border="5")
        img_tag['style'] = "max-width: 100%; height: auto;" 

        graph_space_div.clear()
        graph_space_div.append(img_tag)

    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(str(soup))

    return output_path

def open_in_browser(html_path):
    webbrowser.open('file://' + os.path.realpath(html_path))


html_dir = "/Users/hibiki/Desktop/OK/tttt"
image_path = os.path.join(html_dir, "output.png")  

plot_data(usd_jpy, image_path=image_path)


template_path = os.path.join(html_dir, "wow.html")
output_path = os.path.join(html_dir, "wow.html")
update_html(image_path, template_path, output_path)

open_in_browser(output_path)
