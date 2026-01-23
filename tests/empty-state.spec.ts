import { expect, test } from "@playwright/test";
import { buildTitle, createTodo, deleteTodo, gotoHome } from "./helpers/todos";

test.describe("Empty State", () => {
  test("displays empty state message when no todos exist", async ({ page }) => {
    await gotoHome(page);

    await test.step("Verify empty state message is displayed", async () => {
      await expect(
        page.getByText("No todos yet. Create one to get started!")
      ).toBeVisible();
    });
  });

  test("displays todos list after creating first todo", async ({ page }) => {
    const title = buildTitle("First todo");

    await gotoHome(page);

    await test.step("Verify initial empty state", async () => {
      await expect(
        page.getByText("No todos yet. Create one to get started!")
      ).toBeVisible();
    });

    await test.step("Create first todo", async () => {
      await createTodo(page, title);
    });

    await test.step("Verify empty state message is hidden", async () => {
      await expect(
        page.getByText("No todos yet. Create one to get started!")
      ).not.toBeVisible();
    });

    await test.step("Verify todo is displayed", async () => {
      await expect(page.getByText(title)).toBeVisible();
    });

    await deleteTodo(page, title);
  });

  test("shows empty state again after deleting all todos", async ({ page }) => {
    const title = buildTitle("Temporary todo");

    await gotoHome(page);
    await createTodo(page, title);

    await test.step("Verify todo exists", async () => {
      await expect(page.getByText(title)).toBeVisible();
    });

    await test.step("Delete the todo", async () => {
      await deleteTodo(page, title);
    });

    await test.step("Verify empty state message appears again", async () => {
      await expect(
        page.getByText("No todos yet. Create one to get started!")
      ).toBeVisible();
    });
  });
});
