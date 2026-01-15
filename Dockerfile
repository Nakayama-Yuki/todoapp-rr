# syntax=docker.io/docker/dockerfile:1

# Node.js 24系 Alpine Linux ベースイメージ
FROM node:24-alpine AS base

# ========================================
# 依存関係インストール段階
# ========================================
FROM base AS deps

# libc6-compat は一部のNode.jsパッケージに必要
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 依存関係ファイルをコピー（pnpmロックファイル推奨）
COPY package.json pnpm-lock.yaml* ./

# pnpmで依存関係をインストール
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# ========================================
# ビルド段階
# ========================================
FROM base AS builder

WORKDIR /app

# libc6-compat インストール
RUN apk add --no-cache libc6-compat

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules

# ソースコードをコピー
COPY . .

# ビルト時の環境変数（ARGとして受け取る）
ARG DATABASE_URL=postgresql://todouser:todopass@postgres:5432/todoapp
ENV DATABASE_URL=${DATABASE_URL}

# アプリケーションをビルド
RUN corepack enable pnpm && pnpm run build

# ========================================
# 本番環境実行段階
# ========================================
FROM base AS runner

WORKDIR /app

# 本番環境の設定
ENV NODE_ENV=production
ENV PORT=3000

# libc6-compat インストール
RUN apk add --no-cache libc6-compat

# セキュリティのため非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app

# ビルド出力とファイルをコピー
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules

# 非rootユーザーに切り替え
USER app

# ポート公開
EXPOSE 3000

# アプリケーション起動
CMD ["pnpm", "run", "start"]