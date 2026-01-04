# Discord-VoiceMute-Switch

HTTP リクエスト経由で Discord のボイスチャットのミュート状態を切り替えるツールです。
物理的なスイッチや Stream Deck 等と連携して、ミュートを外部から制御する際に便利です。

## 前提条件

* **Discord アプリ**: 起動している必要があります。
* **Discord Developer Application**: Client ID と Client Secret が必要です。

## セットアップ

1. **リポジトリのクローンまたはダウンロード**
2. **依存関係のインストール**

    ```bash
    npm install
    ```

3. **環境変数の設定**
    `.env.sample` を `.env` にリネーム（またはコピー）し、以下の内容を設定してください。

    ```ini
    CLIENT_ID="あなたのApplication ID"
    CLIENT_SECRET="あなたのClient Secret"
    PORT="55685" # 必要に応じて変更してください
    ```

    * Client ID / Secret は [Discord Developer Portal](https://discord.com/developers/applications) から取得してください。
    * OAuth2 の Redirects に `http://localhost:5768/` を追加しておく必要があります（初回認証用）。

## 使い方

### 起動方法

以下のいずれかのバッチファイルを実行してください。

* `start.bat`: コンソールウィンドウを開いて起動します。
* `trayrun.bat`: システムトレイに常駐する形で起動します（バックグラウンド実行）。

### 初回認証

初回起動時、ブラウザが開き Discord の認証画面が表示されます。
「認証」ボタンを押して、ツールが Discord にアクセスすることを許可してください。
認証情報は `token.json` に保存され、次回以降は自動的にログインします。

### ミュート切り替え

以下の URL にアクセスすることで、ミュートの ON/OFF が切り替わります。

```sh
http://localhost:55685/
```

(ポート番号 `55685` は `.env` で設定した値です)

* **レスポンス**:
  * `muted`: ミュート状態になりました。
  * `unmuted`: ミュート解除されました。

## 開発・ビルド

### 開発モード実行

```bash
npm start
```

### ビルド (exe化)

```bash
npm run build
```

`discord-voicemute-switch.exe` が生成されます。
