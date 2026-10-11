import type { Page } from "@playwright/test";

import { expect, test } from "../../fixtures";

/** Console errors and uncaught exceptions; failed requests are the network fixture's job, so they are skipped. */
const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(`${error.name}: ${error.message}`));
  return errors;
};

test.describe("app shell", { tag: "@smoke" }, () => {
  test("boots and reaches every top-level route from the navigation without errors", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Court Overview" })).toBeVisible();

    await page.getByRole("link", { name: "Cases", exact: true }).click();
    await expect(page).toHaveURL(/#\/cases\/display\/1\/desc\/all$/);
    await expect(page.getByRole("link", { name: /Case 12 title/ })).toBeVisible();

    await page.getByRole("link", { name: "Courts", exact: true }).click();
    await expect(page).toHaveURL(/#\/courts\/1(\/|$)/);
    await expect(page.getByRole("heading", { name: "Jurors Staked in General Court" })).toBeVisible();

    await page.getByRole("link", { name: "Jurors", exact: true }).click();
    await expect(page).toHaveURL(/#\/jurors\/1\/desc\/all$/);
    await expect(page.getByRole("link", { name: "0x1000...0001" })).toBeVisible();

    await page.getByRole("link", { name: "Get PNK", exact: true }).click();
    await expect(page).toHaveURL(/#\/get-pnk$/);
    await expect(page.getByRole("button", { name: /^From/ })).toBeVisible();

    await page.goto("/#/resolver");
    await expect(page.getByRole("heading", { name: "Justice as a Service" })).toBeVisible();

    await page.goto("/#/no-such-page");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

    expect(errors).toEqual([]);
  });
});
