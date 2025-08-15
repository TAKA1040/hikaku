# 価格比較ツール

いつものお店の商品価格と店頭で見つけた商品の価格をリアルタイムで比較するWebアプリケーション

## 🚀 主な機能

- **Googleログイン認証**: 安全なユーザー認証システム
- **クラウドデータ保存**: Supabaseを使用したユーザーごとのデータ管理
- **リアルタイム価格比較**: 登録済み商品と店頭商品の単価を瞬時に比較
- **店舗管理**: よく行く店舗の情報を登録・管理
- **商品管理**: 各店舗の商品価格を登録・更新
- **PWA対応**: スマートフォンにインストール可能
- **レスポンシブデザイン**: モバイルファーストの設計

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14**: React フレームワーク
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: ユーティリティファーストCSS
- **Zustand**: 軽量状態管理
- **Zod**: スキーマ検証

### バックエンド・認証
- **Supabase**: PostgreSQLデータベース + 認証
- **Google OAuth**: Googleアカウントログイン
- **Row Level Security**: データベースレベルのセキュリティ

### 開発・デプロイ
- **ESLint**: コード品質管理
- **React Hot Toast**: 通知システム
- **Lucide React**: アイコンライブラリ

## 📦 セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local.example`を`.env.local`にコピーし、以下の値を設定：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Next Auth Secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. データベースの設定
`database.sql`の内容をSupabase SQLエディタで実行してデータベーススキーマを作成

### 4. Google OAuth の設定
1. Google Cloud Consoleでプロジェクト作成
2. OAuth同意画面を設定
3. 認証情報でOAuthクライアントIDを作成
4. リダイレクトURIを設定: `http://localhost:3000/auth/callback`

### 5. 開発サーバーの起動
```bash
npm run dev
```

## 📱 使い方

### 1. ログイン
Googleアカウントでログインしてください。

### 2. 店舗の登録
「店舗管理」セクションで普段利用する店舗を追加します。

### 3. 商品の登録
「商品管理」セクションで各店舗の商品価格を登録します。
- 商品タイプを選択
- 数量・個数・価格を入力
- 単価が自動計算されます

### 4. 価格比較
「今目の前の商品」セクションで店頭の商品情報を入力すると、登録済み商品との価格比較結果が表示されます。

## 🏗️ データベース構造

### 主要テーブル
- `profiles`: ユーザープロフィール情報
- `stores`: 店舗情報
- `products`: 商品価格情報
- `product_types`: 商品タイプマスタ
- `price_comparisons`: 価格比較履歴
- `user_settings`: ユーザー設定

### セキュリティ
- Row Level Security (RLS) 有効
- ユーザーごとにデータが分離
- 認証済みユーザーのみアクセス可能

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# 型チェック
npm run type-check

# リンター実行
npm run lint
```

## 📈 今後の拡張予定

- [ ] 価格比較履歴の表示
- [ ] 統計・レポート機能
- [ ] お気に入り商品機能
- [ ] バーコードスキャン機能
- [ ] 価格アラート機能
- [ ] データエクスポート機能

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

