import { test, expect } from "@playwright/test";

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
