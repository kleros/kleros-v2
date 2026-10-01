import { expect, test } from "@playwright/test";

import { snapshot } from "./chain";
import { missingEnv } from "./env";
import { ONE_PNK, connectButton, stakeAndVerify, waitUntil, openAsDeployedOrigin } from "./helpers";
import { installMockWallet, MOCK_WALLET_NAME } from "./mockWallet";

const REQUIRED = ["REACT_APP_PRIVY_APP_ID", "E2E_EXTERNAL_WALLET_PRIVATE_KEY", "ALCHEMY_API_KEY"];

test.skip(missingEnv(REQUIRED).length > 0, `missing env: ${missingEnv(REQUIRED).join(", ")}`);

test("external wallet: connect, claim PNK, stake/withdraw paying own gas", async ({ page }) => {
  const { account, log } = await installMockWallet(page, process.env.E2E_EXTERNAL_WALLET_PRIVATE_KEY as `0x${string}`);
  const address = account.address;
  const fmt = (s: Awaited<ReturnType<typeof snapshot>>) =>
    JSON.stringify({ stake: s.stake, eth: s.eth, pnk: s.pnk, claimed: s.claimed }, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    );

  const before = await snapshot(address);
  console.log("before", fmt(before));

  await openAsDeployedOrigin(page);
  await connectButton(page).click();
  await page.getByText("Continue with a wallet").click();
  await page.getByText(MOCK_WALLET_NAME).first().click();
  await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("0xF605...e2dA").first()).toBeVisible();
  await page.screenshot({ path: "../odd/artifacts/task9/external-1-connected.png" });

  if (!before.claimed) {
    await page.getByRole("button", { name: "Claim PNK" }).click();
    const afterClaim = await waitUntil(
      () => snapshot(address),
      (s) => s.pnk > before.pnk
    );
    console.log("after claim", fmt(afterClaim));
    expect(afterClaim.pnk).toBeGreaterThan(before.pnk);
    expect(afterClaim.claimed).toBe(true);
    await page.screenshot({ path: "../odd/artifacts/task9/external-2-claimed.png" });
    await page.reload();
    await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 60_000 });
  }

  const staked = await stakeAndVerify(page, address, "Stake", "1", before.stake + ONE_PNK);
  console.log("after stake", fmt(staked));
  await page.screenshot({ path: "../odd/artifacts/task9/external-3-staked.png" });

  await page.reload();
  await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 60_000 });
  const withdrawn = await stakeAndVerify(page, address, "Withdraw", "1", before.stake);
  console.log("after withdraw", fmt(withdrawn));
  await page.screenshot({ path: "../odd/artifacts/task9/external-4-withdrawn.png" });

  console.log("txs", JSON.stringify(log.map((l) => l.hash)));
  expect(log.length).toBeGreaterThanOrEqual(3);
  expect(withdrawn.eth).toBeLessThan(before.eth);
});
