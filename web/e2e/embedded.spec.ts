import { expect, test } from "@playwright/test";
import { getAddress, type Address } from "viem";

import { snapshot } from "./chain";
import { missingEnv } from "./env";
import {
  ONE_PNK,
  connectButton,
  privyModalSightings,
  stakeAndVerify,
  watchPrivyModal,
  openAsDeployedOrigin,
} from "./helpers";

const REQUIRED = ["REACT_APP_PRIVY_APP_ID", "E2E_PRIVY_TEST_EMAIL", "E2E_PRIVY_TEST_OTP", "ALCHEMY_API_KEY"];
const EMBEDDED_ADDRESS = "0xEECd563bc5e3c7374D2b6Ccd90180055A78D2b97" as Address;

test.skip(missingEnv(REQUIRED).length > 0, `missing env: ${missingEnv(REQUIRED).join(", ")}`);

test("embedded Privy wallet: login, sponsored stake/withdraw without modal or ETH, logout", async ({ page }) => {
  const before = await snapshot(EMBEDDED_ADDRESS);
  console.log(
    "before",
    JSON.stringify({ stake: before.stake, eth: before.eth, pnk: before.pnk }, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    )
  );
  expect(before.eth).toBe(0n);

  await openAsDeployedOrigin(page);
  await connectButton(page).click();
  await page.getByPlaceholder("your@email.com").fill(process.env.E2E_PRIVY_TEST_EMAIL!);
  await page.getByRole("button", { name: "Submit" }).click();
  const otp = process.env.E2E_PRIVY_TEST_OTP!;
  const digits = page.locator("#privy-modal-content input");
  await expect(digits).toHaveCount(otp.length);
  for (const [i, digit] of [...otp].entries()) {
    await digits.nth(i).click();
    await page.keyboard.press(digit);
  }

  await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText(process.env.E2E_PRIVY_TEST_EMAIL!, { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: "../odd/artifacts/task9/embedded-1-logged-in.png" });

  await expect(page.locator("#privy-modal-content")).toBeHidden({ timeout: 30_000 });
  await watchPrivyModal(page);

  const afterStake = await stakeAndVerify(page, EMBEDDED_ADDRESS, "Stake", "1", before.stake + ONE_PNK);
  console.log("after stake", afterStake.stake.toString(), "eth", afterStake.eth.toString());
  await page.screenshot({ path: "../odd/artifacts/task9/embedded-2-staked.png" });
  expect(afterStake.eth).toBe(0n);

  const sightings = await privyModalSightings(page);

  // Close the stake popup / refresh the form state before withdrawing.
  await page.reload();
  await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 60_000 });
  await watchPrivyModal(page);

  const afterWithdraw = await stakeAndVerify(page, EMBEDDED_ADDRESS, "Withdraw", "1", before.stake);
  console.log("after withdraw", afterWithdraw.stake.toString(), "eth", afterWithdraw.eth.toString());
  await page.screenshot({ path: "../odd/artifacts/task9/embedded-3-withdrawn.png" });
  expect(afterWithdraw.eth).toBe(0n);

  sightings.push(...(await privyModalSightings(page)));
  expect(sightings, `Privy modal content appeared: ${JSON.stringify(sightings.slice(0, 3))}`).toEqual([]);
  expect(getAddress(EMBEDDED_ADDRESS)).toBe(EMBEDDED_ADDRESS);

  // The stake popup overlay covers the header; reload to dismiss it.
  await page.reload();
  await page.getByRole("button", { name: "Log out" }).first().click();
  await expect(connectButton(page)).toBeVisible({ timeout: 30_000 });
  await page.screenshot({ path: "../odd/artifacts/task9/embedded-4-logged-out.png" });
});
