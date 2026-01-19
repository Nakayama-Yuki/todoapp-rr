# React Router + PostgreSQL Todoアプリ

このプロジェクトは、React Router v7とPostgreSQLを使用したフルスタックTodoアプリケーションです。

## 技術スタック

- **フロントエンド**: React 19 + React Router v7 + TypeScript 5
- **バックエンド**: Node.js + React Router Server Actions
- **データベース**: PostgreSQL 17 (Docker)
- **ORM/DB**: node-postgres (pg)
- **バリデーション**: Zod
- **スタイリング**: Tailwind CSS v4
- **パッケージマネージャー**: pnpm
- **ビルドツール**: Vite

## セットアップ手順

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定（ローカル開発の場合）

Docker なしでローカル開発する場合は `.env.local` を作成：

```bash
cp .env.local.example .env.local
```

デフォルトの `.env` はすべての環境で共通です。

### 3. Docker コンテナの起動

```bash
# 開発環境: PostgreSQL（DB）のみDockerで起動
pnpm run docker:dev

# アプリはローカルで起動（ホットリロード）
pnpm dev
```

アプリケーションが `http://localhost:5173` で起動します。

### 4. 本番環境の起動

```bash
# Next.js と PostgreSQL をDockerで起動
# （.env の NODE_ENV などを production に変更して実行）
pnpm run docker:prod
```

アプリが `http://localhost:3000` で起動します。

## Docker コマンド一覧

```bash
# 開発環境: PostgreSQL のみ起動
pnpm run docker:dev

# 本番環境: Next.js + PostgreSQL 起動
pnpm run docker:prod

# サービスのログを確認
pnpm run docker:logs       # 開発（DB のみ）
pnpm run prod:logs         # 本番（アプリ + DB）

# PostgreSQL コンテナのみ起動
pnpm run postgres:up

# PostgreSQL のログを表示
pnpm run postgres:logs

# 開発環境を停止
pnpm run dev:down

# 本番環境を停止
pnpm run prod:down

# サービスの状態を確認
pnpm run docker:ps         # 開発
pnpm run prod:ps           # 本番
```

## プロジェクト構造

```
app/
  db/
    index.ts              # PostgreSQL接続プール
  schemas/
    todo.ts               # Zod バリデーションスキーマ
  routes/
    home.tsx              # ホームページ
    todos.tsx             # Todo CRUD 操作
  routes.ts               # ルート定義
.env                      # 統合環境変数（Git 管理対象）
.env.local.example        # ローカル開発用テンプレート
.env.local                # ローカル設定（Git 除外）
init.sql                  # データベース初期化スクリプト
docker-compose.dev.yml    # 開発環境: PostgreSQL のみ
docker-compose.prod.yml   # 本番環境: Next.js + PostgreSQL
Dockerfile                # Docker ビルド設定
```

## 主な機能

### Todoアプリ (`/todos`)

- ✅ Todo の追加
- ✅ Todo の編集
- ✅ Todo の削除
- ✅ 完了状態の切り替え
- ✅ PostgreSQL でのデータ永続化
- ✅ リアルタイムでデータベースと同期

## API エンドポイント

- `GET /todos` - 全ての Todo を取得
- `POST /todos` - 新しい Todo を作成
- `PUT /todos/[id]` - Todo を更新
- `DELETE /todos/[id]` - Todo を削除

## 環境変数について

### ファイル構成

- `.env` - 統合環境変数ファイル（Git 管理対象・秘密情報なし）
- `.env.local.example` - ローカル開発用設定テンプレート（Git 管理対象）
- `.env.local` - ローカル上書き設定（Git 除外・オプション）

### 環境変数の値

```env
# ===== PostgreSQL 設定 =====
POSTGRES_DB=todoapp
POSTGRES_USER=todouser
POSTGRES_PASSWORD=todopass

# ===== データベース接続 =====
# 開発環境: ローカルホスト接続
DATABASE_URL=postgresql://todouser:todopass@localhost:5432/todoapp
DATABASE_HOST=localhost
DATABASE_PORT=5432

# ===== Node.js 環境 =====
NODE_ENV=development
PORT=3000
```

### Docker での環境変数の取り扱い

スタンドアローンモード相当の構成では、環境変数の扱いが重要です：

1. **ビルド時の環境変数** - Dockerfile で ARG として定義（ビルド中のみ使用、最終イメージには含まれない）
2. **実行時の環境変数** - docker-compose.yml の environment で設定（コンテナ起動時に読み込まれる）

開発環境と本番環境の切り替え：

```bash
# 開発環境（ホットリロード対応）
pnpm run docker:dev

# 本番環境（スタンドアローンモード）
pnpm run docker:prod
```

## データベース接続設定

- **Host**: localhost (開発) / postgres (Docker)
- **Port**: 5432
- **Database**: todoapp
- **Username**: todouser
- **Password**: todopass

## トラブルシューティング

### データベースに接続できない場合

1. Docker が起動していることを確認

   ```bash
   pnpm run docker:ps
   ```

2. ポート 5432 が使用されていないことを確認

   ```bash
   lsof -i :5432
   ```

3. 環境変数が正しく設定されていることを確認
   ```bash
   cat .env
   ```

### データをリセットしたい場合

```bash
# コンテナとボリュームを削除
pnpm run dev:down
docker volume rm todoapp-rr_postgres_data
```

新しくボリュームを作成して再起動すると、`init.sql` に定義した未完了のサンプルTodoが3件自動投入されます。

### ログを確認したい場合

```bash
# PostgreSQL のログ確認
pnpm run postgres:logs

# 開発環境全体のログ確認
pnpm run docker:logs
```

## ビルドとデプロイ

### ローカルでのビルド

```bash
pnpm build
```

本番用のバンドルが `build/` ディレクトリに生成されます。

### 本番実行

```bash
# ローカルで本番相当のサーバーを起動
pnpm start

# Docker で起動
pnpm run docker:prod
```
