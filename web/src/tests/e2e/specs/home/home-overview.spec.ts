import { aCounter } from "../../builders/subgraph";
import { eth, NOW_SECONDS, pnk } from "../../builders/types";
import { expect, test } from "../../fixtures";

test.describe("home page", () => {
  test("shows the latest global counters with USD values", async ({ page, subgraph }) => {
    subgraph.world.counters = [
      aCounter({
        id: String(NOW_SECONDS - 60),
        stakedPNK: pnk(2_500_000),
        paidETH: eth(12.5),
        redistributedPNK: pnk(40_000),
        activeJurors: "45",
        cases: "77",
      }),
    ];
    await page.goto("/");

    // USD uses the prices fixture: PNK $0.02, ETH $3,000.
    await expect(page.getByRole("group", { name: "PNK Staked" })).toContainText(/2,500,000\s*\$50,000/);
    await expect(page.getByRole("group", { name: "ETH Paid" })).toContainText(/12\.5\s*\$37,500/);
    await expect(page.getByRole("group", { name: "PNK Redistributed" })).toContainText(/40,000\s*\$800/);
    await expect(page.getByRole("group", { name: "Active Jurors" })).toContainText("45");
    await expect(page.getByRole("group", { name: "Cases" })).toContainText("77");
  });

  test("lists the three latest cases and the top jurors by coherence", async ({ page }) => {
    await page.goto("/");

    const latest = page.getByRole("link", { name: /Case \d+ title/ });
    await expect(latest).toHaveCount(3);
    await expect(latest.nth(0)).toHaveAttribute("href", "#/cases/12");
    await expect(latest.nth(2)).toHaveAttribute("href", "#/cases/10");

    await expect(page.getByRole("heading", { name: "Top Jurors" })).toBeVisible();
    await expect(page.getByRole("link", { name: /^0x1000\.\.\.000\d$/ })).toHaveText([
      "0x1000...0001",
      "0x1000...0002",
      "0x1000...0003",
    ]);
  });

  test("highlights the court with most cases and links to it", async ({ page }) => {
    await page.goto("/");

    // "Most Cases:" in the court overview is the first court link; case cards link their court too.
    await page.getByRole("link", { name: "General Court", exact: true }).first().click();

    await expect(page).toHaveURL(/#\/courts\/1(\/|$)/);
    await expect(page.getByRole("heading", { name: "Latest Cases in General Court" })).toBeVisible();
  });
});
