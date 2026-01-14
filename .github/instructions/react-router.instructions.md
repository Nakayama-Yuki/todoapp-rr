# React Router v7.12.0 Framework Guidelines

Guidelines for building applications with React Router v7.12.0 Framework Mode, focusing on Route Modules, SSR, type-safety, and performance optimization.

## Overview

React Router v7 introduces three routing modes:

- **Declarative Mode**: Basic routing with `BrowserRouter` and JSX route definitions
- **Data Mode**: Route configuration with `loader`/`action` functions using `createBrowserRouter`
- **Framework Mode**: Full-featured framework with Vite integration, SSR, automatic code splitting, and Route Modules

This project uses **Framework Mode** for type-safe routing, SSR support, automatic optimization, and integrated data management.

## Route Module Architecture

### Route Module Structure

Each route is a module exporting components and data handling functions:

```typescript
// app/routes/product.tsx
import type { Route } from "./+types/product";

// Type-safe loader for server-side data fetching
export async function loader({ params }: Route.LoaderArgs) {
  const product = await db.product.findUnique({
    where: { id: params.id }
  });
  if (!product) throw new Response("Not Found", { status: 404 });
  return { product };
}

// Type-safe action for form submissions
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const product = await db.product.update({
    where: { id: formData.get("id") as string },
    data: { name: formData.get("name") as string }
  });
  return { product };
}

// Type-safe component with auto-inferred props
export default function Product({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>{loaderData.product.name}</h1>
      <Form method="post">
        <input type="hidden" name="id" value={loaderData.product.id} />
        <input name="name" defaultValue={loaderData.product.name} />
        <button type="submit">Update</button>
      </Form>
    </div>
  );
}
```

### Client-Side Data Handling

Use `clientLoader` and `clientAction` for client-only operations:

```typescript
// app/routes/dashboard.tsx
import type { Route } from "./+types/dashboard";

// Server-side initial data
export async function loader() {
  return { serverTime: new Date().toISOString() };
}

// Client-side data fetching (runs after hydration)
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const serverData = await serverLoader();
  const clientData = await fetchClientOnlyData();
  return { ...serverData, clientData };
}

// Prevent automatic server revalidation
clientLoader.hydrate = true;

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <p>Server: {loaderData.serverTime}</p>
      <p>Client: {loaderData.clientData}</p>
    </div>
  );
}
```

### Type Safety with Route Types

Leverage auto-generated types from `./+types/*` for complete type safety:

```typescript
import type { Route } from "./+types/user-profile";

// params, loaderData, actionData are all type-safe
export async function loader({ params }: Route.LoaderArgs) {
  // params.userId is typed based on route definition
  const user = await getUser(params.userId);
  return { user };
}

export default function UserProfile({
  loaderData,
  params,
  actionData
}: Route.ComponentProps) {
  // All props are correctly typed without manual definitions
  return <div>{loaderData.user.name}</div>;
}
```

## Server-Side Rendering (SSR)

### Root Layout Setup

Configure root layout with SSR support in `app/root.tsx`:

```typescript
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import type { Route } from "./+types/root";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

// Global error boundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }
  return <div>Something went wrong!</div>;
}
```

### Meta Tags and SEO

Define meta tags per route using the `meta` function:

```typescript
// app/routes/blog-post.tsx
import type { Route } from "./+types/blog-post";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPost(params.slug);
  return { post };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data.post.title },
    { name: "description", content: data.post.excerpt },
    { property: "og:title", content: data.post.title },
    { property: "og:image", content: data.post.coverImage },
    { property: "og:type", content: "article" },
  ];
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  return (
    <article>
      <h1>{loaderData.post.title}</h1>
      <div>{loaderData.post.content}</div>
    </article>
  );
}
```

### Hydration Fallback

Provide loading UI during hydration:

```typescript
// app/routes/heavy-page.tsx
export function HydrateFallback() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}

export default function HeavyPage({ loaderData }: Route.ComponentProps) {
  return <div>{/* Heavy interactive content */}</div>;
}
```

## Data Management

### Automatic Revalidation

React Router automatically revalidates loaders after actions:

```typescript
// app/routes/tasks.tsx
export async function loader() {
  return { tasks: await db.task.findMany() };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await db.task.create({
    data: { title: formData.get("title") as string }
  });
  // Loader automatically re-runs after this action completes
  return { success: true };
}

export default function Tasks({ loaderData }: Route.ComponentProps) {
  // loaderData.tasks will be fresh after form submission
  return (
    <div>
      <Form method="post">
        <input name="title" />
        <button>Add Task</button>
      </Form>
      <ul>
        {loaderData.tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Optimizing Revalidation

Control when loaders should revalidate:

```typescript
import { type ShouldRevalidateFunction } from "react-router";

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  // Only revalidate if search params changed
  if (currentUrl.search !== nextUrl.search) {
    return true;
  }
  // Don't revalidate on same-page form submissions
  if (currentUrl.pathname === nextUrl.pathname) {
    return false;
  }
  return defaultShouldRevalidate;
};
```

### useFetcher for Non-Navigation Updates

Use `useFetcher` for mutations without navigation:

```typescript
import { useFetcher } from "react-router";

export default function TodoItem({ todo }: { todo: Todo }) {
  const fetcher = useFetcher();
  const isUpdating = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" action="/api/toggle-todo">
      <input type="hidden" name="id" value={todo.id} />
      <button type="submit" disabled={isUpdating}>
        {isUpdating ? "Updating..." : todo.completed ? "✓" : "○"}
      </button>
      <span>{todo.title}</span>
    </fetcher.Form>
  );
}
```

## Middleware and Authentication

### Server Middleware

Implement authentication checks before route logic:

```typescript
// app/routes/dashboard.tsx
import type { Route } from "./+types/dashboard";

export async function middleware({ request, context }: Route.MiddlewareArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.userId) {
    throw redirect("/login");
  }

  // Pass authenticated user to loader
  context.set("user", session.user);
}

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get("user");
  const data = await getUserDashboard(user.id);
  return { user, data };
}
```

### Client Middleware

Handle client-side request modifications:

```typescript
export async function clientMiddleware({
  request,
  context,
}: Route.ClientMiddlewareArgs) {
  // Add auth token to requests
  const token = localStorage.getItem("token");
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }

  // Add request tracking
  context.set("requestId", crypto.randomUUID());
}
```

## Error Handling

### Route-Level Error Boundaries

Handle errors at the route level:

```typescript
// app/routes/user.tsx
import { isRouteErrorResponse, useRouteError } from "react-router";
import type { Route } from "./+types/user";

export async function loader({ params }: Route.LoaderArgs) {
  const user = await db.user.findUnique({ where: { id: params.id } });
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  return { user };
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-page">
        <h1>{error.status}</h1>
        <p>{error.data}</p>
        <a href="/users">Back to Users</a>
      </div>
    );
  }

  return (
    <div className="error-page">
      <h1>Unexpected Error</h1>
      <p>Something went wrong. Please try again.</p>
    </div>
  );
}
```

### Error Handling in Loaders/Actions

Throw responses for expected errors:

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    throw new Response("Email is required", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  try {
    await sendEmail(email);
    return { success: true };
  } catch (error) {
    throw new Response("Failed to send email", { status: 500 });
  }
}
```

## Performance Optimization

### Code Splitting and Lazy Loading

Routes are automatically code-split. Define routes in `routes.ts`:

```typescript
// app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("products/:id", "routes/product.tsx"),
  // Nested routes for layout inheritance
  route("dashboard", "routes/dashboard/layout.tsx", [
    index("routes/dashboard/overview.tsx"),
    route("settings", "routes/dashboard/settings.tsx"),
  ]),
] satisfies RouteConfig;
```

### Static Pre-rendering

Generate static pages at build time:

```typescript
// app/routes/blog-post.tsx
export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPost(params.slug);
  return { post };
}

// Pre-render all blog posts at build time
export async function prerender() {
  const posts = await getAllPosts();
  return posts.map((post) => `/blog/${post.slug}`);
}
```

### Prefetching

Use `prefetch` prop on links for faster navigation:

```typescript
import { Link } from "react-router";

export default function ProductList({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          <Link to={`/products/${product.id}`} prefetch="intent">
            {product.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

## Best Practices

### Route Module Organization

- Export loader/action at the top of route modules for clarity
- Keep business logic separate; call services from loaders/actions
- Use type-safe Route.ComponentProps instead of hooks when possible
- Export ErrorBoundary and HydrateFallback as needed per route

### Data Loading Strategy

- Use `loader` for server-rendered data (SEO, initial state)
- Use `clientLoader` for client-only data or progressive enhancement
- Implement `shouldRevalidate` to prevent unnecessary server requests
- Leverage automatic revalidation after actions for data freshness

### Form Handling

- Use `<Form>` component for actions (automatic revalidation)
- Use `useFetcher` for non-navigation mutations (toggles, deletions)
- Validate form data in actions, throw Response for errors
- Access form state via `useNavigation()` for loading indicators

### Type Safety

- Always import and use `Route` types from `./+types/*`
- Avoid manual type definitions for loaderData/actionData
- Use Route.ComponentProps for component props
- Leverage auto-generated types for params, data, and errors

### SSR and Hydration

- Place critical metadata in `meta()` function, not in components
- Use `HydrateFallback` for better perceived performance
- Ensure `Layout` component wraps all content with proper HTML structure
- Include `<Scripts />` for hydration and `<ScrollRestoration />` for UX

### Error Handling

- Implement ErrorBoundary at root and route levels as needed
- Use `isRouteErrorResponse()` to distinguish HTTP errors
- Throw Response objects for expected errors (404, 400, etc.)
- Provide user-friendly error messages with recovery options

### Performance

- Enable SSR in `react-router.config.ts` for initial load performance
- Use `prerender()` for static content (blog posts, docs, landing pages)
- Leverage automatic code splitting; avoid manual dynamic imports
- Use `prefetch="intent"` on important navigation links
- Implement `shouldRevalidate` to reduce server load
