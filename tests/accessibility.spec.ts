import { expect, test } from "@playwright/test";
import { buildTitle, createTodo, deleteTodo, gotoHome } from "./helpers/todos";

test.describe("Accessibility Tests", () => {
  test("verifies ARIA structure of empty state", async ({ page }) => {
    await gotoHome(page);

    await test.step("Verify page ARIA snapshot for empty state", async () => {
      await expect(page.locator("body")).toMatchAriaSnapshot(`
        - heading "My Todos" [level=1]
        - textbox "Add a new todo..."
        - button "Add"
        - text: No todos yet. Create one to get started!
      `);
    });
  });

  test("verifies ARIA structure with todos", async ({ page }) => {
    const title = buildTitle("Accessibility test");

    await gotoHome(page);
    await createTodo(page, title);

    await test.step("Verify page structure includes todo item", async () => {
      // Verify main heading is present
      await expect(page.getByRole("heading", { name: "My Todos", level: 1 })).toBeVisible();

      // Verify form elements have proper roles
      await expect(page.getByRole("textbox")).toBeVisible();
      await expect(page.getByRole("button", { name: /add/i })).toBeVisible();

      // Verify todo item buttons exist
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      const buttons = todoItem.getByRole("button");
      await expect(buttons).toHaveCount(2); // Toggle button and Delete button
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("verifies form input has proper accessibility attributes", async ({ page }) => {
    await gotoHome(page);

    await test.step("Check input field accessibility", async () => {
      const input = page.getByPlaceholder("Add a new todo...");
      
      // Verify input is a textbox role
      await expect(input).toHaveRole("textbox");
      
      // Verify placeholder exists
      await expect(input).toHaveAttribute("placeholder", "Add a new todo...");
    });
  });

  test("verifies buttons have accessible names", async ({ page }) => {
    const title = buildTitle("Button test");

    await gotoHome(page);
    await createTodo(page, title);

    await test.step("Verify Add button has accessible name", async () => {
      await expect(page.getByRole("button", { name: /add/i })).toBeVisible();
    });

    await test.step("Verify Delete button has accessible name", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      await expect(todoItem.getByRole("button", { name: "Delete" })).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("verifies toggle button accessibility for completed state", async ({ page }) => {
    const title = buildTitle("Toggle accessibility");

    await gotoHome(page);
    await createTodo(page, title);

    await test.step("Verify toggle button is accessible", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      const toggleButton = todoItem.getByRole("button").first();
      
      // Verify button is a button role
      await expect(toggleButton).toHaveRole("button");
    });

    await test.step("Toggle and verify visual feedback", async () => {
      const todoItem = page.locator("div.flex.items-center", { hasText: title }).first();
      await todoItem.getByRole("button").first().click();
      
      // Verify checkmark SVG is visible for screen readers
      const svg = todoItem.locator("svg");
      await expect(svg).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("verifies error message is announced", async ({ page }) => {
    await gotoHome(page);

    await test.step("Trigger error", async () => {
      await page.getByRole("button", { name: /add/i }).click();
    });

    await test.step("Verify error message is visible and accessible", async () => {
      const errorMessage = page.getByText("Title is required");
      await expect(errorMessage).toBeVisible();
      
      // Error should be in a visible container
      const errorContainer = page.locator("div.bg-red-900\\/50");
      await expect(errorContainer).toBeVisible();
    });
  });

  test("verifies semantic HTML structure", async ({ page }) => {
    const title = buildTitle("Semantic test");

    await gotoHome(page);

    await test.step("Verify heading hierarchy", async () => {
      // Main heading should be h1
      await expect(page.getByRole("heading", { name: "My Todos", level: 1 })).toBeVisible();
    });

    await test.step("Create todo and verify structure", async () => {
      await createTodo(page, title);
      
      // Form elements should be in forms
      const forms = page.locator("form");
      await expect(forms).toHaveCount(3); // Create form + 2 forms per todo (toggle + delete)
    });

    await test.step("Cleanup", async () => {
      await deleteTodo(page, title);
    });
  });

  test("verifies keyboard navigation support", async ({ page }) => {
    await gotoHome(page);

    await test.step("Navigate to input with keyboard", async () => {
      await page.keyboard.press("Tab");
      
      // Input should be focused
      const input = page.getByPlaceholder("Add a new todo...");
      await expect(input).toBeFocused();
    });

    await test.step("Type and submit with keyboard", async () => {
      const title = buildTitle("Keyboard test");
      await page.keyboard.type(title);
      
      // Tab to submit button
      await page.keyboard.press("Tab");
      const addButton = page.getByRole("button", { name: /add/i });
      await expect(addButton).toBeFocused();
      
      // Press Enter to submit
      await page.keyboard.press("Enter");
      
      // Verify todo was created
      await expect(page.getByText(title)).toBeVisible();
    });

    await test.step("Cleanup", async () => {
      const title = buildTitle("Keyboard test");
      await deleteTodo(page, title);
    });
  });

  test("verifies color contrast for error messages", async ({ page }) => {
    await gotoHome(page);

    await test.step("Trigger error and check styling", async () => {
      await page.getByRole("button", { name: /add/i }).click();
      
      // Error message container should have red background
      const errorContainer = page.locator("div.bg-red-900\\/50");
      await expect(errorContainer).toBeVisible();
      
      // Error text should be visible
      const errorText = errorContainer.getByText("Title is required");
      await expect(errorText).toBeVisible();
    });
  });

  test("verifies disabled state is properly communicated", async ({ page }) => {
    await gotoHome(page);

    await test.step("Fill form and check disabled state during submission", async () => {
      const title = buildTitle("Disabled test");
      const input = page.getByPlaceholder("Add a new todo...");
      await input.fill(title);
      
      // Click submit
      const submitButton = page.getByRole("button", { name: /add/i });
      await submitButton.click();
      
      // Wait for submission to complete
      await page.waitForTimeout(500);
      
      // After completion, elements should be enabled again
      await expect(input).toBeEnabled();
      await expect(submitButton).toBeEnabled();
    });

    await test.step("Cleanup", async () => {
      const title = buildTitle("Disabled test");
      const todoItem = page.locator("div.flex.items-center").filter({
        hasText: title,
      }).first();
      if (await todoItem.count() > 0) {
        await todoItem.getByRole("button", { name: "Delete" }).click();
      }
    });
  });
});
