# CashScanExplorer
<details><summary><h1>Project開発スタートアップ</h1></summary>

# プロジェクトのセットアップ手順

### 前提条件
- Docker Desktopがインストールされていること
- VSCodeがインストールされていること

### 手順
1. コマンドプロンプトorターミナルを開き、プロジェクトのディレクトリに移動します。
   (VScode内で作業するの推奨)
   ```
   cd CSE\CSE_Project
   ```

2. 以下のコマンドを実行して、Dockerイメージをビルドします。
   (Docker desktopを立ち上げておくこと)
   (PCのスペック、状態にもよるが3分程度かかる)
   ```
   docker-compose build
   ```

3. ビルドが完了したら、以下のコマンドでDockerコンテナを起動します。
   ```
   docker-compose up -d
   ```

4. VScodeに拡張機能を追加(デフォルトでインストールされていたかもしれないその場合はスキップ)
   拡張機能検索で「Dev Containers」をインストール
   画面左下に><のマークが出てきて左サイドバーにモニターに><が合わさったアイコンがあれば問題なし

5. コンテナ内に侵入
　モニターに><が合わさったアイコン(リモートエクスプローラー)を選択して開発コンテナ―にcse_Project等の記述があればうまくコンテナがupできています。
以下のコマンドでも確認できます。
   ```
   # コンテナの状態確認
   docker-compose ps
   ```
起動しているコンテナにカーソルを合わせると→がでてきて「現在のウィンドウにアタッチする」といったものがあるためクリック

6. プロジェクトフォルダーの選択
   コンテナ内に入るととりあえず現在のpathを定義する
   ファイルを開くでrootに移動する
   OSがLinuxのためCtrl+Pで検索するかターミナルからcs,lsコマンドで移動していく

7. コンテナ内にgitProjectをクローンする
   以下のコマンドでCSEProjectをクローンする
   ```
   git clone https://github.com/yuto-yoshimuta/CSE.git
   ```
   うまくできない場合はユーザー設定ができていない可能性があるため自分で調べてユーザー名とメールアドレス設定を行う
   うまくクローン出来ればroot/CSEとpathがなっているはず

8. mainProject実行
   path:CSE_Project配下で実行
   ```
   python manage.py runserver
   ```
   出力されるローカルホストにアクセスすれば完了

9. 携帯などで操作する場合、（仮デプロイ）
    前提: ngrokをインストール, ngrokアカウント作成
   出てきたローカルホストURLを○○と定義して以下のコマンドを実行
   ```
   ngrok http ○○
   ```

10. Docker down
   作業が終了すれば以下のコマンドでコンテナを停止することが可能
   ```
   docker-compose down
   ```

### ※注意点
gitのbranchや作業履歴は普通で開いているときとコンテナ内では共有されないため注意 
１度コンテナを作成すれば今後上記の手順を踏まずコンテナを起動させて同じ手順で侵入するのみ
コンテナ起動方法はup を入力してもよいしDocker Desktopから直接起動させてもよい個人的に後者推奨

### 便利なコマンド集
- コンテナのログを表示
```
docker-compose logs
```

- コンテナの状態確認
```
docker-compose ps
```

- コンテナとイメージを完全に削除（クリーンアップ）
```
docker-compose down --rmi all
```
</details>

<details><summary><h1>gitのコマンド操作</h1></summary>

* 現在のブランチを最新の状態にする
```
git pull origin ブランチ名
```

* 新しいブランチを作成してチェックアウトする
```
git checkout -b 新しいブランチ名
```

* ブランチの削除
```
git push origin --delete 新しいブランチ名
```

* 変更を加えてコミットする。（この時点ではまだローカル環境）
```
git add .
git commit -m "コミットメッセージ"
```
[コミットメッセージの書き方(参考)](https://qiita.com/konatsu_p/items/dfe199ebe3a7d2010b3e)
[絵文字](https://gitmoji.dev/)

* リモートに新しいブランチをプッシュする
```
git push origin 新しいブランチ名
```

### 以下からマージするときの流れ

* マージしたいブランチへ移動
```
git checkout main
```

* メインブランチを最新の状態にする
```
git pull origin main
```

* 新しいブランチをメインブランチにマージする
```
git marge 新しいブランチ名
```
</details>

<details><summary><h1>その他git関連(必読)</h1></summary>

## 競合があった場合の解決
1. 競合のあったファイルを手動で修正
2. 修正したファイルをステージ
```
git add 競合したファイル
```
3. マージコミットを作成
```
git commit
```
4. メインブランチをリモートプッシュする
```
git push origin main
```

---

## マージするのが怖い場合はPull Requestをする

以降はリモートにプッシュした後の流れ

1. GitHubリポジトリにアクセス
2. ブランチを選択：ページ上部に表示される「Your recently pushed branches」という通知か、GitHubのブランチリストから先ほどプッシュした新しいブランチを選択
3. Pull Requestを作成：リポジトリの上部に「Compare & pull request」というボタンをクリック
4. Pull Requestの内容を記入：
    * タイトル：Pull Requestの簡単な説明。
    * 説明：具体的にどのような変更を行ったのか、何を解決するための変更かを記述
    * 変更対象のブランチ：マージ先（通常はmainやdevelopなど）と、作業ブランチが正しいか確認
5. ReviewersやAssigneesを設定（必要に応じて）：チームメンバーや他の開発者にレビューしてもらうため、レビュワーを指定
6. すべての情報が入力できたら、Create pull request ボタンを押してPull Requestを作成

</details>

<details><summary><h1>昔のコミット状態に戻す方法</h1></summary>

## 前のコミット状態に戻す方法
```
git reset --hard <コミットハッシュ>
```

### 例（2つ前の情報に戻したい場合）
```
git reset --hard HEAD~2
```

* コミットハッシュを確認する方法
```
git log
```
</details>

<details>マークダウン書き方

[MDチートシートその1](https://qiita.com/kamorits/items/6f342da395ad57468ae3)
[MDチートシートその2](https://qiita.com/Qiita/items/c686397e4a0f4f11683d)
</details>
