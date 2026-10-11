import { parseEther } from "viem";

import { aClassicDispute, aClassicRound, anAnswer } from "../../builders/subgraph";
import { eth } from "../../builders/types";
import { disputeKitClassic, klerosCore } from "../../contracts";
import { expect, test } from "../../fixtures";
import { ALICE } from "../../mocks/subgraph/world";

test.describe("appeal crowdfunding", () => {
  test.beforeEach(async ({ subgraph }) => {
    // Dispute 4 is in the appeal period; jurors ruled "Yes" (choice 1).
    const dispute = subgraph.world.disputes[3];
    dispute.disputeKitDispute = [
      aClassicDispute({
        id: `${klerosCore.address}-4`,
        localRounds: [
          aClassicRound({
            winningChoice: "1",
            answers: [anAnswer(1, { paidFee: eth(0.005) }), anAnswer(2, { paidFee: eth(0.03), funded: true })],
            fundedChoices: ["2"],
          }),
        ],
      }),
    ];
  });

  test("derives each side's required funding from the appeal cost and multipliers", async ({ page }) => {
    // appealCost 0.01 ETH; winner multiplier 100%, loser 200% (mocks/rpc/defaults.ts).
    await page.goto("/#/cases/4/appeal");

    await expect(page.getByText("0.005 out of 0.02 ETH required.")).toBeVisible();
    await expect(page.getByText("Fully funded!")).toBeVisible();
    await expect(page.getByText("0 out of 0.03 ETH required.")).toBeVisible();
  });

  test("funds the selected option with the required amount", async ({ page, wallet, rpc }) => {
    rpc.onCall(disputeKitClassic, "fundAppeal", () => undefined);
    await page.goto("/#/cases/4/appeal");
    await wallet.connect("alice");

    await page.getByText("Yes", { exact: true }).click();
    await expect(page.getByRole("spinbutton", { name: "Amount to fund" })).toHaveValue("0.02");
    await page.getByRole("button", { name: "Fund", exact: true }).click();

    await expect(page.getByText("Thanks for funding the appeal")).toBeVisible();
    expect(rpc.sent(disputeKitClassic, "fundAppeal")).toEqual([
      { args: [4n, 1n], value: parseEther("0.02"), from: expect.stringMatching(new RegExp(ALICE, "i")) },
    ]);
  });

  test("blocks funding above the wallet balance", async ({ page, wallet, rpc }) => {
    rpc.balances.set(ALICE, parseEther("0.001"));
    await page.goto("/#/cases/4/appeal");
    await wallet.connect("alice");

    await page.getByText("Yes", { exact: true }).click();

    await expect(page.getByText("Insufficient balance")).toBeVisible();
    await expect(page.getByRole("button", { name: "Fund", exact: true })).toBeDisabled();
  });
});
