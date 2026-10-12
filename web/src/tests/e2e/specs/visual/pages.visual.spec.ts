import type { Page } from "@playwright/test";

import { expect, test } from "../../fixtures";

// Baselines are Linux renders from the Playwright docker image; update them with `yarn e2e:visual:update`.
// Countdowns tick with the clock and identicons/charts animate, so they are masked.
const dynamic = (page: Page) => [page.getByText(/\d+d \d+h \d+m|\d+h \d+m \d+s|\d+m \d+s/), page.locator("canvas")];

test.describe("visual regression", { tag: "@visual" }, () => {
  test("home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Case 10 title/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "0x1000...0003" })).toBeVisible();

    await expect(page).toHaveScreenshot("home.png", { fullPage: true, mask: dynamic(page) });
  });

  test("case overview", async ({ page }) => {
    await page.goto("/#/cases/4/overview");
    await expect(page.getByRole("heading", { name: "Case 4 title" })).toBeVisible();
    await expect(page.getByText("Court Policy")).toBeVisible();

    await expect(page).toHaveScreenshot("case-overview.png", { fullPage: true, mask: dynamic(page) });
  });

  test("court page", async ({ page }) => {
    await page.goto("/#/courts/1");
    await expect(page.getByRole("heading", { name: "Jurors Staked in General Court" })).toBeVisible();
    await expect(page.getByRole("link", { name: "0x1000...0003" })).toBeVisible();

    await expect(page).toHaveScreenshot("court.png", { fullPage: true, mask: dynamic(page) });
  });
});
