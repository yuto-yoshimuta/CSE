# CashScanExplorer
<details><summary><h1>Project開発スタートアップ</h1></summary>

# プロジェクトのセットアップ手順

このドキュメントでは、MACとWindows環境でプロジェクトをセットアップする手順を説明します。

## MAC版の手順

### 前提条件
- Dockerがインストールされていること
- VSCodeがインストールされていること

### 手順
1. ターミナルを開き、プロジェクトのディレクトリに移動します。
   ```
   cd ~/CSE_Project
   ```

2. 以下のコマンドを実行して、Dockerイメージをビルドします。
   ```
   docker build -t myproject .
   ```

3. ビルドが完了したら、以下のコマンドでDockerコンテナを起動します。
   ```
   docker run -it -v $(pwd):/app -p 8080:8080 myproject
   ```

4. VSCodeを開き、「ファイル」メニューから「フォルダを開く」を選択します。

5. プロジェクトのディレクトリ（~/CSE_Project）を選択して開きます。

6. VSCodeの拡張機能タブを開き、「Dev Containers」拡張機能を検索してインストールします。

7. コマンドパレット（Cmd + Shift + P）を開き、「Dev Containers: Attach to Running Container」を選択します。

8. 起動中のDockerコンテナを選択し、VSCodeでコンテナに接続します。

9. 必要なファイルを編集し、変更を加えます。

10. ターミナルでコンテナ内のシェルを開き、プロジェクトに関連するコマンドを実行します。

## Windows版の手順

### 前提条件
- Docker Desktopがインストールされていること
- VSCodeがインストールされていること

### 手順
1. コマンドプロンプトを開き、プロジェクトのディレクトリに移動します。
   ```
   cd C:\Users\YourUsername\CSE_Project
   ```

2. 以下のコマンドを実行して、Dockerイメージをビルドします。
   ```
   docker build -t myproject .
   ```

3. ビルドが完了したら、以下のコマンドでDockerコンテナを起動します。
   ```
   docker run -it -v %cd%:/app -p 8080:8080 myproject
   ```

4. VSCodeを開き、「ファイル」メニューから「フォルダを開く」を選択します。

5. プロジェクトのディレクトリ（C:\Users\YourUsername\CSE_Project）を選択して開きます。

6. VSCodeの拡張機能タブを開き、「Dev Containers」拡張機能を検索してインストールします。

7. コマンドパレット（Ctrl + Shift + P）を開き、「Dev Containers: Attach to Running Container」を選択します。

8. 起動中のDockerコンテナを選択し、VSCodeでコンテナに接続します。

9. 必要なファイルを編集し、変更を加えます。

10. コマンドプロンプトでコンテナ内のシェルを開き、プロジェクトに関連するコマンドを実行します。


- コンテナを停止
docker-compose down

- コンテナのログを表示
docker-compose logs

- コンテナ内でコマンドを実行
docker-compose exec web bash

- コンテナとイメージを完全に削除（クリーンアップ）
docker-compose down --rmi all


以上の手順に従って、MACとWindows環境でプロジェクトをセットアップし、Dev Containersを使用してDockerコンテナ内で開発を行うことができます。問題がある場合は、Yutoに連絡してください。

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

<details>

[MDチートシートその1](https://qiita.com/kamorits/items/6f342da395ad57468ae3)
[MDチートシートその2](https://qiita.com/Qiita/items/c686397e4a0f4f11683d)
