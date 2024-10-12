# ベースイメージ
FROM python:3.9

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のコピー
COPY requirements.txt .

# 依存関係のインストール
RUN pip install --no-cache-dir -r requirements.txt

# プロジェクトファイルのコピー
COPY . .

# サーバーの起動
CMD ["gunicorn", "cash_scan_explorer.wsgi:application", "--bind", "0.0.0.0:8000"]
