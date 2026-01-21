import { test, expect, type Page } from "@playwright/test";

async function createTodo(page: Page, title: string) {
  await page.goto("/");
  await page.getByPlaceholder("Add a new todo...").fill(title);
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText(title)).toBeVisible();
}

function getTodoItem(page: Page, title: string) {
  return page.locator("div.flex.items-center", { hasText: title }).first();
}

test("should display todo page with title", async ({ page }) => {
  // ホームページにアクセス
  await page.goto("/");

  // ページタイトルが表示されていることを確認
  await expect(page.getByRole("heading", { name: "My Todos" })).toBeVisible();
});

test("should create a new todo", async ({ page }) => {
  // ホームページにアクセス
  await page.goto("/");

  // 入力フィールドにテキストを入力
  await page.getByPlaceholder("Add a new todo...").fill("Test todo item");

  // "Add" ボタンをクリック
  await page.getByRole("button", { name: "Add" }).click();

  // 新しいtodoが一覧に表示されることを確認
  await expect(page.getByText("Test todo item")).toBeVisible();
});

test("should toggle todo completion state", async ({ page }) => {
  const title = `Toggle todo ${Date.now()}`;

  await createTodo(page, title);

  const todoItem = getTodoItem(page, title);
  const titleLocator = todoItem.locator("span", { hasText: title });

  await expect(titleLocator).not.toHaveClass(/line-through/);

  await todoItem.getByRole("button").first().click();

  await expect(titleLocator).toHaveClass(/line-through/);

  // 後片付け
  await todoItem.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(title)).not.toBeVisible();
});

test("should delete a todo", async ({ page }) => {
  const title = `Delete todo ${Date.now()}`;

  await createTodo(page, title);

  const todoItem = getTodoItem(page, title);
  await todoItem.getByRole("button", { name: "Delete" }).click();

  await expect(page.getByText(title)).not.toBeVisible();
});
