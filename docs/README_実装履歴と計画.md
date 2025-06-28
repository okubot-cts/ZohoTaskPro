# ZohoTaskPro 実装履歴・課題・今後の計画

## 1. 実装履歴（時系列まとめ）

### ● プロジェクト初期
- React + TypeScript + Tailwind CSSでタスク管理UI（カンバン・カレンダー・リストビュー等）を実装。
- ZohoCRM連携を目指し、認証・API連携の設計を開始。

### ● Zoho認証フロー（SPA→サーバーサイド移行）
- 当初はフロントエンド（Vite/React）で認証URLを生成。
  - `.env`にVITE_付き環境変数を設定し、import.meta.envで参照。
  - しかし、client_id/redirect_uriがundefinedになる問題が頻発。
- サーバーサイド（Node.js/Express）認証に切り替え。
  - `server/index.js`でExpressサーバーを新設。
  - `server/.env`にVITE_なしの環境変数を定義し、process.envで参照。
  - `/auth/zoho`エンドポイントで認証URLを生成し、リダイレクトする方式に統一。

### ● .envファイルの混乱と解決
- `.env`にVITE_付きやJavaScriptコードが混入し、環境変数が読み込めないトラブルが発生。
- OneDriveの同期遅延・キャッシュ問題で、編集内容が反映されない現象も発生。
- .envを一度削除→ローカルで新規作成→正しい内容をコピペ→再配置で解決。

### ● フロントエンドの修正
- 「Zohoでログイン」ボタンのonClickを必ず`http://localhost:4000/auth/zoho`にリダイレクトするよう修正。
- フロントで認証URLを組み立てるコードやVITE_付き環境変数の参照を全て削除。
- ボタンのアイコン（Zohoロゴ）も削除し、テキストのみのシンプルなボタンに変更。

### ● サーバー・フロントの起動ポート
- Vite（React）は`http://localhost:3001/`（または3000）で起動。
- Expressサーバーは`http://localhost:4000/`で起動。

---

## 2. 主な課題・トラブルとその解決策

- .envの内容・場所・ファイル名の混乱
  - → VITE_なし、4行だけ、server直下に設置で解決
- OneDriveの同期遅延・キャッシュ
  - → ローカルで新規作成・再配置で解決
- フロントで認証URLを組み立ててしまう設計ミス
  - → サーバー経由のみに統一
- ボタンUIの細部（アイコン削除等）
  - → テキストボタンに修正

---

## 3. 次回ログイン・開発に向けた計画

### ● 今後の運用・開発フロー

1. サーバー（Express）とフロント（Vite/React）をそれぞれ起動
   - サーバー: `cd server && node index.js`
   - フロント: `npm run dev`（プロジェクトルートで）

2. 「Zohoでログイン」ボタンを押すだけで認証フローが動作
   - フロントは`http://localhost:3001/`でアクセス
   - ボタンは`http://localhost:4000/auth/zoho`にリダイレクト

3. 認証後、アクセストークン取得・API連携の実装へ進む
   - サーバー側で`/auth/zoho/callback`を受け、トークン取得
   - 取得したトークンをフロントに返すAPI設計・実装

4. 今後の課題
   - トークンの安全な保存・管理（セッション/DB/クッキー等）
   - ZohoCRM APIとの実際のデータ連携（タスク取得・作成・更新）
   - 本番環境用のリダイレクトURI・環境変数管理
   - UI/UXのさらなる改善（スマホ対応、エラーハンドリング等）

---

# 以上

この内容は今後の開発・運用の指針となります。必要に応じて随時アップデートしてください。

VITE_ZOHO_CLIENT_ID=your_client_id
VITE_ZOHO_CLIENT_SECRET=your_client_secret
VITE_ZOHO_REDIRECT_URI=http://localhost:3001/ZohoTaskPro/
VITE_ZOHO_API_BASE_URL=https://www.zohoapis.com 