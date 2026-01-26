import { expect, test } from "@playwright/test";
import {
  buildTitle,
  clearAllTodos,
  createTodo,
  deleteTodo,
  gotoHome,
} from "./helpers/todos";

test("persists created todos after reload", async ({ page }) => {
  const title = buildTitle("Persist todo");

  await clearAllTodos(page);
  await createTodo(page, title);

  await page.reload();

  await expect(page.getByText(title)).toBeVisible();

  await deleteTodo(page, title);
});
