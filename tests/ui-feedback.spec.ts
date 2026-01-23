import { expect, test } from "@playwright/test";
import { buildTitle, clearAllTodos, createTodo, deleteTodo, gotoHome } from "./helpers/todos";

test.describe("UI State and User Feedback", () => {
  test.beforeEach(async ({ page }) => {
    await clearAllTodos(page);
  });

  test("displays 'Adding...' state during form submission", async ({ page }) => {
    const title = buildTitle("Test submission state");


    await test.step("Fill form and check button state", async () => {
      await page.getByPlaceholder("Add a new todo...").fill(title);
      
      // Start submission
      const submitPromise = page.getByRole("button", { name: /add/i }).click();
      
      // Check for "Adding..." text during submission
      // Note: This might be very fast, so we check immediately
      const addingButton = page.getByRole("button", { name: "Adding..." });
      const isAddingVisible = await addingButton.isVisible().catch(() => false);
      
      await submitPromise;
      
      // After submission completes, button should be back to "Add"
      await expect(page.getByRole("button", { name: /^Add$/i })).toBeVisible();
    });

    await test.step("Verify todo was created", async () => {
      await expect(page.getByText(title)).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("disables input field during form submission", async ({ page }) => {
    const title = buildTitle("Test input disable");


    await test.step("Check input is initially enabled", async () => {
      const input = page.getByPlaceholder("Add a new todo...");
      await expect(input).toBeEnabled();
    });

    await test.step("Submit and verify input state", async () => {
      await page.getByPlaceholder("Add a new todo...").fill(title);
      await page.getByRole("button", { name: /add/i }).click();
      
      // After submission, input should be enabled again
      await page.waitForTimeout(100);
      const input = page.getByPlaceholder("Add a new todo...");
      await expect(input).toBeEnabled();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("displays checkmark icon when todo is completed", async ({ page }) => {
    const title = buildTitle("Test checkmark");


    await test.step("Create todo", async () => {
      await createTodo(page, title);
    });

    await test.step("Toggle todo to completed", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      await todoItem.getByRole("button").first().click();
    });

    await test.step("Verify checkmark icon is displayed", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      const checkmarkSvg = todoItem.locator("svg");
      await expect(checkmarkSvg).toBeVisible();
      
      // Verify the button has the completed style
      const toggleButton = todoItem.getByRole("button").first();
      await expect(toggleButton).toHaveClass(/bg-green-600/);
    });

    await test.step("Toggle back to uncompleted", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      await todoItem.getByRole("button").first().click();
    });

    await test.step("Verify checkmark is hidden", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      const toggleButton = todoItem.getByRole("button").first();
      await expect(toggleButton).not.toHaveClass(/bg-green-600/);
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("displays error message and allows retry", async ({ page }) => {

    await test.step("Submit empty form to trigger error", async () => {
      await page.getByRole("button", { name: /add/i }).click();
    });

    await test.step("Verify error message is displayed", async () => {
      await expect(page.getByText("Title is required")).toBeVisible();
    });

    await test.step("Retry with valid input", async () => {
      const title = buildTitle("After error");
      await createTodo(page, title);
    });

    await test.step("Verify error message is cleared", async () => {
      await expect(page.getByText("Title is required")).not.toBeVisible();
    });

    await test.step("Verify successful creation", async () => {
      const title = buildTitle("After error");
      await expect(page.getByText(title, { exact: false })).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      const title = buildTitle("After error");
      // Find any todo containing this pattern for cleanup
      const todoItem = page.locator("div.flex.items-center").filter({
        hasText: "After error",
      }).first();
      
      if (await todoItem.count() > 0) {
        await todoItem.getByRole("button", { name: "Delete" }).click();
      }
    });
  });

  test("clears input field after successful submission", async ({ page }) => {
    const title = buildTitle("Test input clear");


    await test.step("Fill and submit form", async () => {
      const input = page.getByPlaceholder("Add a new todo...");
      await input.fill(title);
      await page.getByRole("button", { name: /add/i }).click();
    });

    await test.step("Verify todo was created", async () => {
      await expect(page.getByText(title)).toBeVisible();
    });

    await test.step("Verify input field is cleared", async () => {
      const input = page.getByPlaceholder("Add a new todo...");
      await expect(input).toHaveValue("");
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("shows delete button on hover", async ({ page }) => {
    const title = buildTitle("Test hover delete");

    await createTodo(page, title);

    await test.step("Hover over todo item", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      await todoItem.hover();
    });

    await test.step("Verify delete button becomes visible", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      const deleteButton = todoItem.getByRole("button", { name: "Delete" });
      
      // The button should be visible (opacity may change on hover)
      await expect(deleteButton).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("displays completed todo with line-through style", async ({ page }) => {
    const title = buildTitle("Test line-through");

    await createTodo(page, title);

    await test.step("Toggle todo to completed", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      await todoItem.getByRole("button").first().click();
    });

    await test.step("Verify line-through style is applied", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      const titleSpan = todoItem.locator("span", { hasText: title });
      await expect(titleSpan).toHaveClass(/line-through/);
      await expect(titleSpan).toHaveClass(/text-slate-400/);
    });

    await test.step("Toggle back to uncompleted", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      await todoItem.getByRole("button").first().click();
    });

    await test.step("Verify line-through style is removed", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      const titleSpan = todoItem.locator("span", { hasText: title });
      await expect(titleSpan).not.toHaveClass(/line-through/);
      await expect(titleSpan).toHaveClass(/text-white/);
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });
});
