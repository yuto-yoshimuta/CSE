# ベースイメージの指定
FROM python:3.9-slim

# 作業ディレクトリの設定
WORKDIR /app

# 必要なパッケージのインストール（日本語フォントを追加）
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    gcc \
    python3-dev \
    git \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# matplotlibの設定ファイルを作成
RUN mkdir -p /root/.config/matplotlib && \
    echo "backend : Agg" > /root/.config/matplotlib/matplotlibrc

# Python依存関係のインストール
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# プロジェクトファイルのコピー
COPY . .

# ポートの公開
EXPOSE 8080

# 起動コマンド
CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]