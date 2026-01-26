import { expect, test } from "@playwright/test";
import {
  buildTitle,
  clearAllTodos,
  createTodo,
  deleteTodo,
  getTodoItem,
  gotoHome,
  toggleTodo,
} from "./helpers/todos";

test.describe("Multiple Todos Management", () => {
  test.beforeEach(async ({ page }) => {
    await clearAllTodos(page);
  });

  test("creates and displays multiple todos", async ({ page }) => {
    const titles = [
      buildTitle("First todo"),
      buildTitle("Second todo"),
      buildTitle("Third todo"),
    ];

    await test.step("Create multiple todos", async () => {
      for (const title of titles) {
        await createTodo(page, title);
      }
    });

    await test.step("Verify all todos are displayed", async () => {
      for (const title of titles) {
        await expect(page.getByText(title)).toBeVisible();
      }
    });

    await test.step("Verify todo count", async () => {
      const todoItems = page.locator("div.flex.items-center").filter({
        has: page.locator('input[name="intent"][value="update"]'),
      });
      await expect(todoItems).toHaveCount(titles.length);
    });

    await test.step("Cleanup", async () => {
      for (const title of titles) {
        await deleteTodo(page, title);
      }
    });
  });

  test("deletes specific todo from multiple todos", async ({ page }) => {
    const titles = [
      buildTitle("Keep 1"),
      buildTitle("Delete this"),
      buildTitle("Keep 2"),
    ];

    await test.step("Create multiple todos", async () => {
      for (const title of titles) {
        await createTodo(page, title);
      }
    });

    await test.step("Delete middle todo", async () => {
      await deleteTodo(page, titles[1]);
    });

    await test.step("Verify deleted todo is not visible", async () => {
      await expect(page.getByText(titles[1])).not.toBeVisible();
    });

    await test.step("Verify other todos remain", async () => {
      await expect(page.getByText(titles[0])).toBeVisible();
      await expect(page.getByText(titles[2])).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, titles[0]);
      await deleteTodo(page, titles[2]);
    });
  });

  test("toggles completion state of individual todos", async ({ page }) => {
    const titles = [
      buildTitle("Todo 1"),
      buildTitle("Todo 2"),
      buildTitle("Todo 3"),
    ];

    await test.step("Create multiple todos", async () => {
      for (const title of titles) {
        await createTodo(page, title);
      }
    });

    await test.step("Toggle first todo to completed", async () => {
      const todoItem = await toggleTodo(page, titles[0]);
      await expect(todoItem.getByRole("button").first()).toHaveClass(
        /bg-green-600/,
      );
    });

    await test.step("Verify other todos remain uncompleted", async () => {
      const todo2 = getTodoItem(page, titles[1]);
      await expect(todo2.getByRole("button").first()).not.toHaveClass(
        /bg-green-600/,
      );

      const todo3 = getTodoItem(page, titles[2]);
      await expect(todo3.getByRole("button").first()).not.toHaveClass(
        /bg-green-600/,
      );
    });

    await test.step("Toggle third todo to completed", async () => {
      const todoItem = await toggleTodo(page, titles[2]);
      await expect(todoItem.getByRole("button").first()).toHaveClass(
        /bg-green-600/,
      );
    });

    await test.step("Verify middle todo still uncompleted", async () => {
      const todo2 = getTodoItem(page, titles[1]);
      await expect(todo2.getByRole("button").first()).not.toHaveClass(
        /bg-green-600/,
      );
    });

    await test.step("Cleanup", async () => {
      for (const title of titles) {
        await deleteTodo(page, title);
      }
    });
  });

  test("displays todos in correct order (newest first)", async ({ page }) => {
    const titles = [
      buildTitle("First created"),
      buildTitle("Second created"),
      buildTitle("Third created"),
    ];

    await test.step("Create todos sequentially with delay", async () => {
      for (const title of titles) {
        await createTodo(page, title);
        await page.waitForTimeout(100); // Small delay to ensure different creation times
      }
    });

    await test.step("Verify todos are in reverse chronological order", async () => {
      const todoItems = page.locator("div.flex.items-center").filter({
        has: page.locator('input[name="intent"][value="update"]'),
      });

      // The newest (third created) should be first in the list
      await expect(todoItems.first()).toContainText(titles[2]);
      // The oldest (first created) should be last
      await expect(todoItems.last()).toContainText(titles[0]);
    });

    await test.step("Cleanup", async () => {
      for (const title of titles) {
        await deleteTodo(page, title);
      }
    });
  });
});
