# Dockerfile
FROM python:3.9

# 作業ディレクトリを設定
WORKDIR /app

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Pythonパッケージの要件をコピー
COPY requirements.txt .

# パッケージをインストール
RUN pip install --no-cache-dir -r requirements.txt

# プロジェクトファイルをコピー
COPY . .

# ポート8000を公開
EXPOSE 8000

# 起動コマンド
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]