import { expect, test } from "@playwright/test";
import {
  buildTitle,
  clearAllTodos,
  createTodo,
  deleteTodo, 
} from "./helpers/todos";

test("creates a todo from the home page", async ({ page }) => {
  const title = buildTitle("Create todo");

  await clearAllTodos(page);
  await createTodo(page, title);

  await expect(page.getByText(title)).toBeVisible();

  await deleteTodo(page, title);
});
