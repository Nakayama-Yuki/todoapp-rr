# todoapp-rr 開発ガイド

## 守る設計

- React Router v8 の SSR、React、TypeScript、Zod、PostgreSQL、Tailwind v4 を使用する。パッケージ管理は pnpm、品質チェックは Biome。
- ルートは [app/routes.ts](app/routes.ts) で明示的に登録する。現在の画面は `/`、実装は `app/routes/home.tsx`。REST の `/todos` エンドポイントはない。
- データ取得は `app/components/home.loader.ts`、変更は `app/components/home.action.ts` に分け、ルートから再エクスポートする。
- フォームは React Router の `Form`、処理の分岐は `FormData` の `intent` を使う。`useActionData()` でエラー、`useNavigation()` で送信状態を表示する。成功時は `redirect("/")`、失敗時は `{ error: string }` を返す。
- 入力は action 内で Zod 検証する。スキーマは `app/schemas/todo.ts`、型は可能な範囲でスキーマから推論する。
- ルート型は `.react-router/types/` に生成される。`pnpm typecheck` で生成・検証し、生成物は直接編集しない。

## データ・UI

- DB は [app/db/index.ts](app/db/index.ts) の `query()` / `getClient()` を使用し、SQL はパラメータ化する。取得したクライアントは解放する。
- DB 変数は `DATABASE_HOST`、`DATABASE_PORT`、`DATABASE_USER`、`DATABASE_PASSWORD`、`DATABASE_NAME`。`dotenv/config` で `.env` を読む。`.env.local` の自動読込を前提にしない。
- ローカル設定は `.env.example` を `.env` にコピーする。Docker が読む `POSTGRES_*` の補足は README を参照する。
- スキーマ変更は `init.sql` と関連型に反映し、既存 DB への適用方法も明記する。
- `app/root.tsx` の共通レイアウトとエラー境界を保つ。スタイルは `app/app.css` と Tailwind v4 のユーティリティを使う。
- パスエイリアスは `~/*` → `app/*`。TypeScript は strict、ESM と型専用 import を使用する。
- Biome の規則は `biome.json` を参照する。未使用変数・明示的 any・CommonJS・JSX key の違反を残さない。

## 検証

```bash
pnpm typecheck
pnpm check
pnpm build
pnpm exec playwright install --with-deps chromium
pnpm exec playwright test
```

- `pnpm lint` は lint、`pnpm format` は整形の検査、`pnpm check` は両方の検査。書き換える場合は意図して `--write` を付ける。
- E2E は `tests/` と `playwright.config.ts` を参照。`webServer` がポート5173で `pnpm dev` を起動し、ワーカーは1つ。
- テストは Todo を削除するため専用 DB を使う。`tests/helpers/todos.ts` のフィクスチャ操作に合わせ、既存サンプルデータの影響を確認する。
- CI は `.github/workflows/node.js.yml` を参照する。実行できなかった確認は理由を報告する。

## 文書の管理

セットアップと使い方は [README.md](README.md) を参照。開発時の指示はこのファイルで管理し、実装・設定・コマンドを変更した場合は関連する説明も更新する。依存バージョンとスクリプトは `package.json`、詳細設定は各設定ファイルを正とする。
