import { expect, test } from "./fixtures";

test("load the homepage", { tag: "@local-stack" }, async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Court Overview")).toBeVisible();
});
