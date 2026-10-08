import { expect, test } from "@playwright/test";

// Match Vite's IPv4 preview host; localhost can resolve to a separate IPv6 server.
test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173/#" });

for (const theme of ["light", "dark"] as const) {
  for (const width of [375, 899, 900, 1023, 1024, 1440]) {
    test(`${theme} layout at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((mode) => localStorage.setItem("theme", JSON.stringify(mode)), theme);
      await page.goto("/");
      await expect(page.getByRole("heading", { name: "Court Overview", exact: true })).toBeVisible();
      await expect(page.locator('a[href="#/"] > svg:visible')).toHaveCount(1);
      await expect(page.locator("body")).toHaveCSS(
        "background-color",
        theme === "dark" ? "rgb(42, 18, 96)" : "rgb(252, 254, 255)"
      );
      const cases = page.getByRole("link", { name: "Cases", exact: true });
      if (width >= 900) {
        await expect(cases).toBeVisible();
        await expect(page.getByRole("button", { name: "Connect", exact: true })).toBeVisible();
      } else {
        await expect(cases).not.toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
}
