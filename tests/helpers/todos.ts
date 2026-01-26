import { expect, type Page } from "@playwright/test";

export function buildTitle(prefix: string) {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export async function gotoHome(page: Page) {
  await page.goto("/");
}

export async function clearAllTodos(page: Page) {
  await gotoHome(page);
  
  // Delete all existing todos one by one
  while (true) {
    const deleteButtons = page.getByRole("button", { name: "Delete" });
    const count = await deleteButtons.count();
    
    if (count === 0) {
      break;
    }
    
    await deleteButtons.first().click({ force: true });
    // Wait for navigation to complete after deletion
    await page.waitForLoadState("networkidle");
  }
}

export function getTodoItem(page: Page, title: string) {
  return page.locator("div.flex.items-center", { hasText: title }).first();
}

export async function createTodo(page: Page, title: string) {
  await page.getByPlaceholder("Add a new todo...").fill(title);
  await page.getByRole("button", { name: /add/i }).click();
  
  // Wait for the todo to appear in the list (more specific selector)
  const todoItem = page.locator("div.flex.items-center").filter({ hasText: title });
  await expect(todoItem.first()).toBeVisible();
}

export async function toggleTodo(page: Page, title: string) {
  const todoItem = getTodoItem(page, title);
  await todoItem.getByRole("button").first().click();
  return todoItem;
}

export async function deleteTodo(page: Page, title: string) {
  const todoItem = page.locator("div.flex.items-center").filter({ hasText: title }).first();
  const deleteButton = todoItem.getByRole("button", { name: "Delete" });
  
  // Check if the todo item exists before trying to delete
  const count = await todoItem.count();
  if (count === 0) {
    return; // Todo already deleted or doesn't exist
  }
  
  await deleteButton.click({ force: true });
  await expect(todoItem).not.toBeVisible({ timeout: 5000 });
}
