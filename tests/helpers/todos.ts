import { expect, type Page } from "@playwright/test";

export function buildTitle(prefix: string) {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export async function gotoHome(page: Page) {
  await page.goto("/");
}

export function getTodoItem(page: Page, title: string) {
  return page.locator("div.flex.items-center", { hasText: title }).first();
}

export async function createTodo(page: Page, title: string) {
  await page.getByPlaceholder("Add a new todo...").fill(title);
  await page.getByRole("button", { name: /add/i }).click();
  await expect(page.getByText(title)).toBeVisible();
}

export async function toggleTodo(page: Page, title: string) {
  const todoItem = getTodoItem(page, title);
  await todoItem.getByRole("button").first().click();
  return todoItem;
}

export async function deleteTodo(page: Page, title: string) {
  const todoItem = getTodoItem(page, title);
  await todoItem.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(title)).not.toBeVisible();
}
