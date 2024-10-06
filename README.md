# CashScanExplorer

<details><summary>gitのコマンド操作</summary>

* 現在のブランチを最新の状態にする
```
git pull origin ブランチ名
```

* 新しいブランチを作成してチェックアウトする
```
git checkout -b 新しいブランチ名
```

* 変更を加えてコミットする。（この時点ではまだローカル環境）
```
git add .
git commit -m "コミットメッセージ"
```

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

<details open><summary>その他git関連(必読)</summary>
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

## マージするのが怖い場合はPull Request(以降PR)をする





[MDチートシートその1](https://qiita.com/kamorits/items/6f342da395ad57468ae3)
[MDチートシートその2](https://qiita.com/Qiita/items/c686397e4a0f4f11683d)