import type { Page } from "@playwright/test";
import { parseEther } from "viem";

import { klerosCore, pnk } from "../../contracts";
import { expect, test } from "../../fixtures";
import { Revert } from "../../mocks/rpc/server";

// NumberInputField swaps a read-only input for an editable one on focus.
const typeAmount = async (page: Page, amount: string) => {
  const input = page.getByRole("textbox", { name: "Amount to stake" });
  await input.click();
  await input.fill(amount);
};

test.describe("staking in a court", () => {
  test.beforeEach(async ({ page, wallet }) => {
    await page.goto("/#/courts/1");
    await wallet.connect("alice");
    await expect(page.getByText("Available 10,000 PNK")).toBeVisible();
  });

  test("rejects an amount above the PNK balance", async ({ page }) => {
    await typeAmount(page, "20000");

    await expect(page.getByText("Insufficient balance to stake this amount")).toBeVisible();
    await expect(page.getByTestId("stake-withdraw-button")).toBeDisabled();
  });

  test("rejects a stake below the court minimum", async ({ page }) => {
    await typeAmount(page, "100");

    await expect(page.getByText("Min Stake in court is: 200 PNK")).toBeVisible();
    await expect(page.getByTestId("stake-withdraw-button")).toBeDisabled();
  });

  test("approves PNK then sends setStake for the court and amount", async ({ page, rpc }) => {
    // Allowance follows the increaseAllowance transactions the app sends.
    rpc.onCall(pnk, "allowance", () => rpc.sent(pnk, "increaseAllowance").reduce((sum, tx) => sum + tx.args[1], 0n));
    rpc.onCall(pnk, "increaseAllowance", () => true);
    rpc.onCall(klerosCore, "setStake", () => undefined);

    await typeAmount(page, "1000");
    await page.getByTestId("stake-withdraw-button").click();

    await expect(page.getByText("You successfully staked")).toBeVisible();
    expect(rpc.sent(pnk, "increaseAllowance").map((tx) => tx.args)).toEqual([[klerosCore.address, parseEther("1000")]]);
    expect(rpc.sent(klerosCore, "setStake").map((tx) => tx.args)).toEqual([[1n, parseEther("1000")]]);
  });

  test("surfaces the revert reason when the stake simulation fails", async ({ page, rpc }) => {
    test.fail(
      true,
      'KNOWN BUG: utils/parseWagmiError.ts shows viem metaMessages[0] ("Contract Call:") instead of the reason'
    );
    rpc.onCall(pnk, "allowance", () => parseEther("10000"));
    rpc.onCall(klerosCore, "setStake", () => {
      throw new Revert("Staking is paused");
    });

    await typeAmount(page, "500");

    // react-query retries a failed simulation three times with 1s, 2s, 4s backoff before reporting it.
    await expect(page.getByText(/Staking is paused/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("stake-withdraw-button")).toBeDisabled();
    expect(rpc.transactions).toEqual([]);
  });
});
