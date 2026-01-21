import { expect, test } from "@playwright/test";
import {
  buildTitle,
  createTodo,
  deleteTodo,
  getTodoItem,
  gotoHome,
  toggleTodo,
} from "./helpers/todos";

test("toggles a todo completion state on and off", async ({ page }) => {
  const title = buildTitle("Toggle todo");

  await gotoHome(page);
  await createTodo(page, title);

  const todoItem = getTodoItem(page, title);
  const label = todoItem.locator("span", { hasText: title });

  await expect(label).not.toHaveClass(/line-through/);

  await toggleTodo(page, title);
  await expect(label).toHaveClass(/line-through/);

  await toggleTodo(page, title);
  await expect(label).not.toHaveClass(/line-through/);

  await deleteTodo(page, title);
});
