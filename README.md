# CashScanExplorer

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



[MDチートシートその1](https://qiita.com/kamorits/items/6f342da395ad57468ae3)
[MDチートシートその2](https://qiita.com/Qiita/items/c686397e4a0f4f11683d)