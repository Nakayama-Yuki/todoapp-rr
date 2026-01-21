import { expect, test } from "@playwright/test";
import { buildTitle, createTodo, deleteTodo, gotoHome } from "./helpers/todos";

test("deletes a todo from the list", async ({ page }) => {
  const title = buildTitle("Delete todo");

  await gotoHome(page);
  await createTodo(page, title);

  await deleteTodo(page, title);
  await expect(page.getByText(title)).not.toBeVisible();
});
