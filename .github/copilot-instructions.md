# AI Copilot Instructions for todoapp-rr

This document guides AI agents in understanding and contributing to the todoapp-rr codebase. It documents the essential architecture, patterns, and workflows for productive development.

## Project Overview

**todoapp-rr** is a full-stack Todo application built with React Router v7 and PostgreSQL. It demonstrates server-side rendering (SSR), data loaders/actions, and form-centric development patterns.

- **Tech Stack**: React 19 + React Router v7 + TypeScript 5 + Zod + Tailwind CSS v4 + PostgreSQL 17
- **Key Tool**: Biome for linting and formatting
- **Package Manager**: pnpm
- **Build Tool**: Vite (via React Router integration)

## Architecture

### Core Layers

1. **UI Layer** (`app/routes/`, `app/root.tsx`)
   - React Router defines file-based routes automatically
   - Each route exports `meta`, `loader`, `action`, and `default` components
   - `app/root.tsx` is the root layout with error boundaries

2. **Data Layer** (`app/db/index.ts`)
   - PostgreSQL connection pool (pg client) with 20 max connections
   - Functions: `query()`, `transaction()` for SQL execution with timing logs
   - Environment variable validation at startup for DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME

3. **Schema Layer** (`app/schemas/`)
   - Zod schemas for runtime validation (TodoSchema, UpdateTodoSchema)
   - Type inference: `type CreateTodoInput = z.infer<typeof TodoSchema>`
   - Schema files co-located with route logic

4. **Route Handlers** (`app/components/home.loader.ts`, `app/components/home.action.ts`)
   - **Loaders**: Server-side data fetching; runs before rendering
   - **Actions**: Form handlers; validate input via Zod before database operations
   - Error responses returned to `useActionData()` hook in components

### Data Flow

```
Form Submit → Action Handler → Zod Validation → DB Query → Response
                                                    ↓
                                           useActionData() updates UI

Page Load → Loader → DB Query → loaderData prop → Component Render
```

## Key Patterns & Conventions

### 1. File-Based Routing

- Route components live in `app/routes/`
- Loaders/Actions are separate files: `app/components/{route}.loader.ts`, `app/components/{route}.action.ts`
- Import and re-export in route component:
  ```tsx
  export { action } from "../components/home.action";
  export { loader } from "../components/home.loader";
  ```

### 2. Form-Centric Actions

- Actions receive `FormData` and discriminate intent via `formData.get("intent")`
- Validation happens in the action, not on the client
- Errors returned as `{ error: string }`, success as `{ success: true }`
- See `app/components/home.action.ts` for implementation example

### 3. Database Queries

- Always use parameterized queries: `db.query("SELECT * FROM todos WHERE id = $1", [id])`
- Queries return `{ rows, rowCount }` from pg client
- Each route should fetch only required data in loaders (no over-fetching)
- See `app/components/home.loader.ts` for implementation example

### 4. Validation & Type Safety

- **Zod for runtime validation**: All user inputs validated in actions
- **TypeScript for static types**: Exported types from schemas inferred from Zod
- Route types auto-generated in `.react-router/types/` by React Router
- See `app/schemas/todo.ts` for TodoSchema and Todo type definitions

### 5. UI/Form Integration

- Use `<Form method="post">` from React Router (not `<form>`)
- Use `useActionData()` to access action responses
- Use `useNavigation()` to track form submission state
- See `app/routes/home.tsx` for UI pattern with `isSubmitting` state

### 6. Styling

- Tailwind CSS v4 via `@tailwindcss/vite`
- Prefer utility classes over custom CSS
- Global styles in `app/app.css`

## Development Workflows

### Local Setup

```bash
# Install dependencies
pnpm install

# Database only (Docker)
pnpm run docker:dev

# App development (local, with hot reload)
pnpm dev
# Runs on http://localhost:5173
```

### Build & Production

```bash
# Build for production
pnpm run build

# Start production server
pnpm run start

# Docker production (app + database)
pnpm run docker:prod
```

### Quality & Testing

```bash
# Lint
pnpm run lint

# Format
pnpm run format

# Type check
pnpm run typecheck

# Full check
pnpm run check
```

### Database Commands

```bash
# Start PostgreSQL only (development)
pnpm run postgres:up

# View logs
pnpm run docker:logs
pnpm run postgres:logs

# Stop
pnpm run dev:down
```

## Environment Configuration

- `.env`: Shared variables (Git-tracked)
- `.env.local`: Local overrides (Git-ignored)
- Required in `app/db/index.ts`:
  - `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`

## Code Quality Standards

### Biome Configuration

- Formatter: 2-space indentation, double quotes
- Linter Rules:
  - `noUnusedVariables`: error
  - `noExplicitAny`: error
  - `noCommonJs`: error (ESM only)
  - `useJsxKeyInIterable`: error
  - See `biome.json` for full configuration

### TypeScript Configuration

- Target: ES2024
- Module: esnext
- Strict mode enabled
- Path alias: `~/*` → `./app/*`
- See `tsconfig.json` for full configuration

## Docker Best Practices (Multi-Stage)

- **Stage 1 (base)**: Node 24-alpine
- **Stage 2 (deps)**: Install dependencies with pnpm frozen lockfile
- **Stage 3 (builder)**: Build app, set DATABASE_URL ARG
- **Stage 4 (runner)**: Production image with non-root user (uid:1001)
- See `Dockerfile` for multi-stage build implementation

## Common Tasks for AI Agents

### Adding a New Feature

1. Create schema in `app/schemas/` for validation
2. Create database schema migration (run via init.sql or migrations)
3. Create loader in `app/components/{route}.loader.ts` to fetch data
4. Create action in `app/components/{route}.action.ts` to handle mutations
5. Create route component in `app/routes/` that exports loader/action
6. Implement form UI using Tailwind + React Router Form component
7. Run `pnpm typecheck` to verify types
8. Run `pnpm check` to lint/format

### Debugging Database Issues

- Check environment variables: `.env` or `.env.local` must have DATABASE\_\* vars
- Pool settings in `app/db/index.ts`: max 20 connections
- View logs: `pnpm run postgres:logs`
- Connection errors logged to console with timing info

### Performance Considerations

- Loaders run sequentially; defer non-critical data fetching
- Use `Promise.all()` for independent queries in loaders
- Minimize data sent to client; select only needed fields in SQL
- Tailwind purges unused styles at build time
- React Router enables SSR by default in `react-router.config.ts`

## Related Documentation Files

- **React Best Practices**: `.github/skills/react-best-practices/AGENTS.md` (40+ performance rules)
- **Instructions by File Type**:
  - Docker: `.github/instructions/docker.instructions.md`
  - GitHub Actions: `.github/instructions/github-actions.instructions.md`
  - React Router: `.github/instructions/react-router.instructions.md`
  - ReactJS: `.github/instructions/reactjs.instructions.md`
  - TypeScript: `.github/instructions/typescript.instructions.md`

---

**Last Updated**: January 2026  
**Next Review**: When adding new layers (auth, caching, API routes, etc.)
