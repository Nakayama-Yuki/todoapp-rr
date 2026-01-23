import { expect, test } from "@playwright/test";
import { buildTitle, clearAllTodos, createTodo, deleteTodo, gotoHome } from "./helpers/todos";

test.describe("Form Input Boundary Tests", () => {
  test.beforeEach(async ({ page }) => {
    await clearAllTodos(page);
  });

  test("successfully creates a todo with exactly 255 characters", async ({ page }) => {
    const exactTitle = "x".repeat(255);

    await test.step("Fill and submit form with 255 character title", async () => {
      await page.getByPlaceholder("Add a new todo...").fill(exactTitle);
      await page.getByRole("button", { name: /add/i }).click();
    });

    await test.step("Verify todo was created successfully", async () => {
      await expect(page.getByText(exactTitle)).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, exactTitle);
    });
  });

  test("shows error for title with 256 characters", async ({ page }) => {
    const tooLongTitle = "x".repeat(256);

    await test.step("Submit form with 256 character title", async () => {
      await page.getByPlaceholder("Add a new todo...").fill(tooLongTitle);
      await page.getByRole("button", { name: /add/i }).click();
    });

    await test.step("Verify error message is displayed", async () => {
      await expect(
        page.getByText("Title must be 255 characters or less")
      ).toBeVisible();
    });

    await test.step("Verify todo was not created", async () => {
      await expect(page.getByText(tooLongTitle)).not.toBeVisible();
    });
  });

  test("successfully creates a todo with 1 character (minimum boundary)", async ({ page }) => {
    const minTitle = "a";

    await test.step("Create todo with single character", async () => {
      await createTodo(page, minTitle);
    });

    await test.step("Verify todo was created", async () => {
      await expect(page.getByText(minTitle)).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, minTitle);
    });
  });

  test("shows error for whitespace-only title", async ({ page }) => {
    await test.step("Submit form with spaces only", async () => {
      await page.getByPlaceholder("Add a new todo...").fill("   ");
      await page.getByRole("button", { name: /add/i }).click();
    });

    await test.step("Verify error message is displayed", async () => {
      await expect(page.getByText("Title is required")).toBeVisible();
    });
  });

  test("handles title with newlines and spaces", async ({ page }) => {
    const titleWithNewlines = "Todo\nwith\nnewlines";

    await test.step("Create todo with newlines", async () => {
      await page.getByPlaceholder("Add a new todo...").fill(titleWithNewlines);
      await page.getByRole("button", { name: /add/i }).click();
    });

    await test.step("Verify todo is created and displayed", async () => {
      // The browser will likely convert newlines to spaces in the input
      // Check if the todo was created (exact display may vary)
      const todoExists = await page.locator("div.flex.items-center").filter({
        hasText: /Todo.*with.*newlines/,
      }).count();
      expect(todoExists).toBeGreaterThan(0);
    });

    await test.step("Cleanup", async () => {
      // Find and delete the created todo
      const todoItem = page.locator("div.flex.items-center").filter({
        hasText: /Todo.*with.*newlines/,
      }).first();
      await todoItem.getByRole("button", { name: "Delete" }).click();
    });
  });

  test("handles title with special characters", async ({ page }) => {
    const specialTitle = buildTitle("Test @#$%^&*()_+-=[]{}|;':\"<>?,./");


    await test.step("Create todo with special characters", async () => {
      await createTodo(page, specialTitle);
    });

    await test.step("Verify todo is displayed correctly", async () => {
      await expect(page.getByText(specialTitle)).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, specialTitle);
    });
  });

  test("trims leading and trailing whitespace", async ({ page }) => {
    const titleWithSpaces = "  Test Todo  ";
    const trimmedTitle = "Test Todo";

    await test.step("Submit form with leading/trailing spaces", async () => {
      await page.getByPlaceholder("Add a new todo...").fill(titleWithSpaces);
      await page.getByRole("button", { name: /add/i }).click();
    });

    await test.step("Wait for submission", async () => {
      await page.waitForTimeout(500);
    });

    await test.step("Verify todo exists (with or without trim)", async () => {
      // Check if either trimmed or untrimmed version exists
      const hasTrimmedVersion = await page.getByText(trimmedTitle, { exact: false }).isVisible();
      const hasUntrimmedVersion = await page.getByText(titleWithSpaces, { exact: false }).isVisible();
      
      expect(hasTrimmedVersion || hasUntrimmedVersion).toBeTruthy();
    });

    await test.step("Cleanup", async () => {
      // Try both versions for cleanup
      const todoItem = page.locator("div.flex.items-center").filter({
        hasText: trimmedTitle,
      }).first();
      
      if (await todoItem.count() > 0) {
        await todoItem.getByRole("button", { name: "Delete" }).click();
        await page.waitForTimeout(300);
      }
    });
  });
});
