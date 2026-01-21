import { expect, test } from "@playwright/test";
import { gotoHome } from "./helpers/todos";

test("shows an error when title is empty", async ({ page }) => {
  await gotoHome(page);

  await page.getByRole("button", { name: /add/i }).click();

  await expect(page.getByText("Title is required")).toBeVisible();
});

test("shows an error when title exceeds 255 characters", async ({ page }) => {
  const longTitle = "x".repeat(256);

  await gotoHome(page);

  await page.getByPlaceholder("Add a new todo...").fill(longTitle);
  await page.getByRole("button", { name: /add/i }).click();

  await expect(
    page.getByText("Title must be 255 characters or less"),
  ).toBeVisible();
  await expect(page.getByText(longTitle)).not.toBeVisible();
});
