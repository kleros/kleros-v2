import { aStake } from "../../builders/subgraph";
import { NOW_SECONDS, pnk } from "../../builders/types";
import { expect, test } from "../../fixtures";
import { JURORS } from "../../mocks/subgraph/world";
import { selectCourt } from "../../pages/dropdown";

test.describe("court page", () => {
  test("shows a sub-court's breadcrumb, parameters and policy", async ({ page }) => {
    await page.goto("/#/courts/2");

    await expect(page.getByRole("button", { name: "General Court" })).toBeVisible();
    await expect(page.getByText(/^Min Stake\s*300 PNK/)).toBeVisible();
    await expect(page.getByText(/^Reward Per Vote\s*0\.001 ETH/)).toBeVisible();
    await expect(page.getByText("Skills required by the Blockchain.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Latest Cases in Blockchain" })).toBeVisible();
  });

  test("lists jurors staked in the court by stake and filters them by address", async ({ page, subgraph }) => {
    const [general] = subgraph.world.courts;
    const [juror] = subgraph.world.users;
    subgraph.world.stakes.push(
      aStake(
        { id: "0x2000000000000000000000000000000000000002", userAddress: "0x2000000000000000000000000000000000000002" },
        general,
        pnk(5)
      )
    );
    await page.goto("/#/courts/1");

    const jurors = page.getByRole("link", { name: /^0x[0-9a-f]{4}\.\.\.[0-9a-f]{4}$/i });
    await expect(jurors).toHaveText(["0x1000...0001", "0x1000...0002", "0x1000...0003", "0x2000...0002"]);

    // The first search box belongs to "Jurors Staked", the second to "Staking History".
    await page.getByRole("textbox", { name: "Search by address" }).first().fill(String(juror.id));
    await expect(jurors).toHaveText(["0x1000...0001"]);
  });

  test("shows the staking history from Atlas", async ({ page, atlas }) => {
    atlas.stakingEvents = [
      {
        address: JURORS[0],
        courtId: "1",
        amount: pnk(1234),
        timestamp: String(NOW_SECONDS - 3600),
        txHash: `0x${"ab".repeat(32)}`,
      },
    ];
    await page.goto("/#/courts/1");

    // Desktop and mobile rows are both rendered; only one is visible.
    await expect(page.getByText("1,234").filter({ visible: true })).toBeVisible();
    expect(atlas.operations.map((o) => o.operationName)).toContain("GetStakingEvents");
  });

  test("navigates between courts with the court selector", async ({ page }) => {
    await page.goto("/#/courts/1");
    await selectCourt(page, ["General Court", "Curation"]);

    await expect(page).toHaveURL(/#\/courts\/3/);
    await expect(page.getByRole("heading", { name: "Jurors Staked in Curation" })).toBeVisible();
  });
});
