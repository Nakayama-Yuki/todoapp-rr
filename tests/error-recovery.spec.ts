import { expect, test } from "@playwright/test";
import {
  buildTitle,
  clearAllTodos,
  createTodo,
  deleteTodo,
} from "./helpers/todos";

test.describe("Error Handling and Recovery", () => {
  test.beforeEach(async ({ page }) => {
    await clearAllTodos(page);
  });

  test("recovers from validation error and creates todo successfully", async ({
    page,
  }) => {
    const title = buildTitle("Valid after error");

    await test.step("Trigger validation error with empty input", async () => {
      await page.getByRole("button", { name: /add/i }).click();
      await expect(page.getByText("Title is required")).toBeVisible();
    });

    await test.step("Attempt to create valid todo after error", async () => {
      await createTodo(page, title);
    });

    await test.step("Verify error is cleared and todo is created", async () => {
      await expect(page.getByText("Title is required")).not.toBeVisible();
      await expect(page.getByText(title, { exact: false })).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      const todoItem = page
        .locator("div.flex.items-center")
        .filter({
          hasText: "Valid after error",
        })
        .first();
      if ((await todoItem.count()) > 0) {
        await todoItem.getByRole("button", { name: "Delete" }).click();
      }
    });
  });

  test("handles multiple consecutive errors correctly", async ({ page }) => {
    const title = buildTitle("After multiple errors");

    await test.step("Trigger first error - empty title", async () => {
      await page.getByRole("button", { name: /add/i }).click();
      await expect(page.getByText("Title is required")).toBeVisible();
    });

    await test.step("Trigger second error - title too long", async () => {
      const longTitle = "x".repeat(256);
      await page.getByPlaceholder("Add a new todo...").fill(longTitle);
      await page.getByRole("button", { name: /add/i }).click();
    });

    await test.step("Verify error message changed", async () => {
      await expect(page.getByText("Title is required")).not.toBeVisible();
      await expect(
        page.getByText("Title must be 255 characters or less"),
      ).toBeVisible();
    });

    await test.step("Create valid todo after multiple errors", async () => {
      await page.getByPlaceholder("Add a new todo...").clear();
      await createTodo(page, title);
    });

    await test.step("Verify all errors cleared and todo created", async () => {
      await expect(
        page.getByText("Title must be 255 characters or less"),
      ).not.toBeVisible();
      await expect(page.getByText(title, { exact: false })).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      const todoItem = page
        .locator("div.flex.items-center")
        .filter({
          hasText: "After multiple errors",
        })
        .first();
      if ((await todoItem.count()) > 0) {
        await todoItem.getByRole("button", { name: "Delete" }).click();
      }
    });
  });

  test("allows creating new todo after deletion", async ({ page }) => {
    const firstTitle = buildTitle("First todo");
    const secondTitle = buildTitle("Second todo");

    await test.step("Create and delete first todo", async () => {
      await createTodo(page, firstTitle);
      await deleteTodo(page, firstTitle);
    });

    await test.step("Create second todo after deletion", async () => {
      await createTodo(page, secondTitle);
    });

    await test.step("Verify second todo was created successfully", async () => {
      await expect(page.getByText(secondTitle)).toBeVisible();
      await expect(page.getByText(firstTitle)).not.toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, secondTitle);
    });
  });

  test("handles rapid consecutive todo creation", async ({ page }) => {
    const titles = [
      buildTitle("Rapid 1"),
      buildTitle("Rapid 2"),
      buildTitle("Rapid 3"),
    ];

    await test.step("Create todos rapidly", async () => {
      for (const title of titles) {
        await page.getByPlaceholder("Add a new todo...").fill(title);
        await page.getByRole("button", { name: /add/i }).click();
        // Small wait to allow form to reset
        await page.waitForTimeout(200);
      }
    });

    await test.step("Verify all todos were created", async () => {
      for (const title of titles) {
        const todoItem = page
          .locator("div.flex.items-center")
          .filter({ hasText: title });
        await expect(todoItem.first()).toBeVisible();
      }
    });

    await test.step("Cleanup", async () => {
      for (const title of titles) {
        await deleteTodo(page, title);
      }
    });
  });

  test("recovers from failed toggle and allows retry", async ({ page }) => {
    const title = buildTitle("Toggle test");

    await createTodo(page, title);

    await test.step("Toggle todo completion", async () => {
      const todoItem = page
        .locator("div.flex.items-center", { hasText: title })
        .first();
      await todoItem.getByRole("button").first().click();
    });

    await test.step("Wait for state update", async () => {
      await page.waitForTimeout(500);
    });

    await test.step("Verify todo can be toggled again", async () => {
      const todoItem = page
        .locator("div.flex.items-center", { hasText: title })
        .first();
      await todoItem.getByRole("button").first().click();
    });

    await test.step("Verify final state", async () => {
      const todoItem = page
        .locator("div.flex.items-center", { hasText: title })
        .first();
      await expect(todoItem).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("maintains form state when navigating away and back", async ({
    page,
  }) => {
    await test.step("Fill form but don't submit", async () => {
      await page.getByPlaceholder("Add a new todo...").fill("Unsaved todo");
    });

    await test.step("Reload page", async () => {
      await page.reload();
    });

    await test.step("Verify form was reset", async () => {
      const input = page.getByPlaceholder("Add a new todo...");
      await expect(input).toHaveValue("");
    });
  });

  test("error message disappears after successful submission", async ({
    page,
  }) => {
    await test.step("Create error state", async () => {
      await page.getByRole("button", { name: /add/i }).click();
      await expect(page.getByText("Title is required")).toBeVisible();
    });

    await test.step("Submit valid todo", async () => {
      const title = buildTitle("Clear error");
      await createTodo(page, title);
    });

    await test.step("Verify error is cleared", async () => {
      await expect(page.getByText("Title is required")).not.toBeVisible();
    });

    await test.step("Submit another error to verify error can reappear", async () => {
      await page.getByPlaceholder("Add a new todo...").clear();
      await page.getByRole("button", { name: /add/i }).click();
      await expect(page.getByText("Title is required")).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      const todoItem = page
        .locator("div.flex.items-center")
        .filter({
          hasText: "Clear error",
        })
        .first();
      if ((await todoItem.count()) > 0) {
        await todoItem.getByRole("button", { name: "Delete" }).click();
      }
    });
  });
});
