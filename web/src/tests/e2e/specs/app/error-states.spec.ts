import { mainnet } from "viem/chains";

import { expect, test } from "../../fixtures";

test.describe("degraded states", () => {
  test("shows an empty case list while the subgraph is down", async ({ page, subgraph }) => {
    subgraph.fail("core");
    await page.goto("/#/cases/display/1/desc/all");

    await expect(page.getByText(/^Total\s*0$/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Case \d+ title/ })).toHaveCount(0);
  });

  test("tells the user when the subgraph query fails", async ({ page, subgraph }) => {
    test.fail(
      true,
      "KNOWN BUG: context/GraphqlBatcher.tsx wraps a non-awaited request in try/catch, so no toast fires"
    );
    subgraph.fail("core");
    await page.goto("/#/cases/display/1/desc/all");

    await expect(page.getByText("Graph query error: failed to fetch data.")).toBeVisible();
  });

  test("asks a wallet on the wrong network to switch before staking", async ({ page, wallet }) => {
    await page.goto("/#/courts/1");
    await wallet.connect("alice", undefined, mainnet.id);

    const switchButton = page.getByRole("button", { name: "Switch to Arbitrum Sepolia" }).first();
    await expect(switchButton).toBeVisible();
    await expect(page.getByTestId("stake-withdraw-button")).toBeHidden();

    await switchButton.click();

    await expect(page.getByTestId("stake-withdraw-button")).toBeVisible();
  });
});
