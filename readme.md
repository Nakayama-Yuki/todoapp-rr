# React Router + PostgreSQL Todoアプリ

このプロジェクトは、React Router v7とPostgreSQLを使用したフルスタックTodoアプリケーションです。

## セットアップ手順

### 1. PostgreSQLの起動（開発）

DockerでDBだけを起動します（アプリはローカルで動かす想定）。

```bash
docker compose --profile db up -d
```

PostgreSQLコンテナが起動します。接続情報は`.env`ファイルに記載されています。

### 2. データベースマイグレーション（開発は手動）

```bash
pnpm migrate:up
```

`migrations/`ディレクトリ内のマイグレーションファイルを実行して、`todos`テーブルを作成します。

> 本番相当（`--profile prod`）で起動する場合は、コンテナ起動時に自動でマイグレーションが走ります。

### 3. 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションが`http://localhost:5173`で起動します。

### 4. 本番相当の起動（アプリ＋DBをDockerで）

```bash
docker compose --profile prod up -d --build
```

アプリが`http://localhost:3000`で起動します（内部ではPostgreSQLサービス名`postgres`で接続）。

## 使用技術

- **フロントエンド**: React 19 + React Router v7
- **バックエンド**: Node.js + React Router Server Actions
- **データベース**: PostgreSQL 17
- **ORM/DB**: node-postgres (pg)
- **バリデーション**: Zod
- **スタイリング**: Tailwind CSS v4
- **ビルドツール**: Vite

## プロジェクト構造

```
app/
  db/
    index.ts              # PostgreSQL接続プール
  schemas/
    todo.ts               # Todのバリデーションスキーマ（Zod）
  routes/
    home.tsx              # ホームページ
    todos.tsx             # Todoページ（CRUD操作）
  routes.ts               # ルート定義
migrations/
  1704067200_create_todos_table.ts  # マイグレーションファイル
docker-compose.yml        # PostgreSQL環境設定
.env                      # 環境変数（ローカル開発用）
.env.example              # 環境変数テンプレート
```

## 主な機能

### Todoアプリ (`/todos`)

- **一覧表示**: すべてのTodoを表示（作成日時でソート）
- **作成**: 新しいTodoを作成
- **更新**: Todoの完了状態を切り替え
- **削除**: Todoを削除
- **バリデーション**: Zodを使ったフォーム入力バリデーション
- **エラーハンドリング**: 入力エラーとDB操作エラーをユーザーに表示

## API仕様

### Loader: GET /todos

Todoリストを取得します。

**レスポンス:**

```typescript
Todo[]
type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
```

### Action: POST /todos

#### 作成 (intent=create)

```
title: string (必須、1-255文字)
```

#### 更新 (intent=update)

```
id: number (必須)
completed?: boolean
title?: string (1-255文字)
```

#### 削除 (intent=delete)

```
id: number (必須)
```

## 環境変数

`.env`ファイルで設定：

```
DATABASE_URL=postgres://todouser:todopass@localhost:5432/todoapp  # 開発（ローカルアプリ→Docker DB）
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=todouser
DATABASE_PASSWORD=todopass
DATABASE_NAME=todoapp
NODE_ENV=development

# Dockerコンテナ内でアプリを動かす場合（prodプロファイル）に切り替える値の例：
# DATABASE_URL=postgres://todouser:todopass@postgres:5432/todoapp
# DATABASE_HOST=postgres
# NODE_ENV=production
```

## ビルドとデプロイ

### ビルド

```bash
pnpm build
```

本番用のバンドルが`build/`ディレクトリに生成されます。

### 本番実行

```bash
pnpm start
```

Dockerで実行する場合：

```bash
docker build -t todoapp .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://user:pass@db:5432/todoapp \
  todoapp
```

## トラブルシューティング

### PostgreSQL接続エラー

1. `docker-compose ps`でコンテナが起動しているか確認
2. `.env`ファイルの接続情報が正しいか確認
3. `docker-compose logs postgres`でPostgreSQLのログを確認

### マイグレーションエラー

```bash
# マイグレーションの状態確認
pnpm migrate

# 前回のマイグレーションを取り消す
pnpm migrate:down
```

### 型エラー

```bash
pnpm typecheck
```
