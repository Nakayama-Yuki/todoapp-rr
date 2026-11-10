# React Router + PostgreSQL Todo アプリ

React Router v8 の SSR、React、TypeScript、Zod、Tailwind CSS v4、PostgreSQL 17 を使う Todo アプリです。追加・編集・削除・完了切替と DB への永続化に対応します。依存バージョンと全スクリプトは [package.json](package.json) を参照してください。

## 前提

Node.js LTS、pnpm、PostgreSQL 17 を用意します。付属 Docker スクリプトは `docker-compose` コマンドを使用します。`docker compose` を使う環境では対応するファイルを指定して実行してください。

## セットアップ

```bash
git clone https://github.com/Nakayama-Yuki/todoapp-rr.git
cd todoapp-rr
pnpm install
cp .env.example .env
```

`.env` に次の DB 接続情報を設定します。`app/db/index.ts` は `dotenv/config` で `.env` を読み込み、以下の5変数を検証します。`.env.local` の自動読込はありません。

| 変数 | ローカルでの例 |
| --- | --- |
| `DATABASE_HOST` | `localhost` |
| `DATABASE_PORT` | `5432` |
| `DATABASE_USER` | `todouser` |
| `DATABASE_PASSWORD` | ローカルDBのパスワード |
| `DATABASE_NAME` | `todoapp` |

Docker Compose で DB を起動する場合は、現在の `.env.example` にない `POSTGRES_*` も `.env` に追記します。アプリ側の `DATABASE_*` と同じ DB名・ユーザー・パスワードを設定してください。

```dotenv
POSTGRES_DB=todoapp
POSTGRES_USER=todouser
POSTGRES_PASSWORD=replace-with-your-local-db-password
```

`.env` は Git 除外です。値を設定したら DB とアプリを起動します。

```bash
pnpm docker:dev
pnpm dev
```

画面は http://localhost:5173 です。ローカルの PostgreSQL を利用する場合は DB の Docker 起動は不要です。スキーマは `init.sql` を対象 DB に適用してください。Compose で空のボリュームを作成した場合は自動適用されます。

## ルーティングとデータ処理

画面は `/` のみで、[app/routes.ts](app/routes.ts) に登録されています。`/todos` や `/todos/[id]` の REST API はありません。

- `app/routes/home.tsx`：画面と React Router の `Form`。
- `app/components/home.loader.ts`：初期データ取得。
- `app/components/home.action.ts`：POST の `FormData` にある `intent` で作成・更新・削除を分岐。
- `app/schemas/todo.ts`：Zod バリデーション。
- `app/db/index.ts`：パラメータ化クエリと接続プール。

成功時は `/` へリダイレクトし、失敗時は action のエラーを表示します。

## 検証

```bash
pnpm typecheck
pnpm check
pnpm build
pnpm exec playwright install --with-deps chromium
pnpm exec playwright test
```

`pnpm check` は Biome の lint・整形の検査、`pnpm lint` は lint、`pnpm format` は整形の検査です。ファイルを書き換える場合は `--write` を付けます。

E2E は `tests/` にあり、`playwright.config.ts` がポート5173で開発サーバーを起動します。有効なブラウザは Chromium、ワーカーは1つです。テストは Todo の削除も行うため、専用 DB と専用の接続設定を使ってください。初期サンプルデータとフィクスチャの削除処理は `tests/helpers/todos.ts` を参照します。

## ビルド・起動

```bash
pnpm build
pnpm start
```

出力は `build/`、本番サーバーの標準ポートは3000です。起動時も `DATABASE_*` が必要です。

## Docker

開発は [docker-compose.dev.yml](docker-compose.dev.yml)（DBのみ）、本番用構成は [docker-compose.prod.yml](docker-compose.prod.yml)（React Router アプリと DB）です。

```bash
pnpm docker:logs
pnpm postgres:logs
pnpm docker:ps
pnpm dev:down
```

本番用ファイルは `prod` プロファイルを持ちます。現在の `pnpm docker:prod` には `--profile prod` がないため、使用する場合は直接指定します。

```bash
docker-compose -f docker-compose.prod.yml --env-file .env --profile prod up -d --build
# 停止
docker-compose -f docker-compose.prod.yml --env-file .env --profile prod down
```

本番用の環境では `NODE_ENV=production`、`DATABASE_HOST=postgres`、`DATABASE_PORT=5432` にし、`POSTGRES_*` と DB 接続情報を一致させてください。Dockerfile が受け取る `DATABASE_URL` もコンテナ内部の DB を指す値にします。`DATABASE_URL` だけでは、アプリが必須とする5つの `DATABASE_*` を代用できません。

Docker の実行段階で `pnpm` を使う構成です。実行イメージでの pnpm の利用可否を含め、デプロイ前にイメージのビルド・起動を検証してください。

停止コマンドでは名前付きボリュームのデータは残ります。空ボリュームでの初期化時には `init.sql` のサンプルデータが投入されます。既存 DB の更新は初回初期化と分けて扱ってください。

## トラブルシューティング

- 必須変数のエラー：`.env` の `DATABASE_*` 5変数を確認します。
- DB 接続失敗：DB の起動状態、ポート、アプリと Compose の DB名・ユーザー・パスワードの一致を確認します。
- ブラウザ起動失敗：`pnpm exec playwright install --with-deps chromium` でブラウザと依存ライブラリを用意します。
- E2E のデータ不整合：専用 DB を使い、フィクスチャと初期データの状態を確認します。

品質チェック・CI は [.github/workflows/node.js.yml](.github/workflows/node.js.yml)、開発ルールは [AGENTS.md](AGENTS.md) を参照してください。
