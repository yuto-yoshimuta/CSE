# ベースイメージ
FROM node:14

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のコピー
COPY package.json .
RUN npm install

# ソースコードのコピー
COPY . .

# アプリのビルド
RUN npm run build

# サーバーの起動
CMD ["npm", "run", "serve"]
