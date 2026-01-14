//　ルートを定義するファイル
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("todos", "routes/todos.tsx"),
] satisfies RouteConfig;
