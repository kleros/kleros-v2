import { expect, test } from "@playwright/test";
import { type Address } from "viem";

import { snapshot } from "./chain";
import { missingEnv } from "./env";
import { COURT_URL, ONE_PNK, connectButton, stakeAndVerify } from "./helpers";
import { installMockWallet } from "./mockWallet";

const REQUIRED = [
  "REACT_APP_PRIVY_APP_ID",
  "E2E_PRIVY_TEST_EMAIL",
  "E2E_PRIVY_TEST_OTP",
  "E2E_EXTERNAL_WALLET_PRIVATE_KEY",
  "ALCHEMY_API_KEY",
];
const EMBEDDED_ADDRESS = "0xEECd563bc5e3c7374D2b6Ccd90180055A78D2b97" as Address;

test.skip(missingEnv(REQUIRED).length > 0, `missing env: ${missingEnv(REQUIRED).join(", ")}`);

// Regression: a pre-authorized injected wallet (e.g. Rabby, which answers eth_accounts after a past
// authorization) must not hijack transactions of a user who logged in with Privy email/Google.
test("embedded Privy login with a pre-authorized injected wallet never prompts the injected wallet", async ({
  page,
}) => {
  const { account, signingRequests } = await installMockWallet(
    page,
    process.env.E2E_EXTERNAL_WALLET_PRIVATE_KEY as `0x${string}`,
    "Rabby Wallet"
  );
  const before = await snapshot(EMBEDDED_ADDRESS);
  expect(before.eth).toBe(0n);

  await page.goto(COURT_URL);
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
  await expect(page.locator("#privy-modal-content")).toBeHidden({ timeout: 30_000 });

  const afterStake = await stakeAndVerify(page, EMBEDDED_ADDRESS, "Stake", "1", before.stake + ONE_PNK);
  expect(afterStake.eth).toBe(0n);

  await page.reload();
  await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 60_000 });
  const afterWithdraw = await stakeAndVerify(page, EMBEDDED_ADDRESS, "Withdraw", "1", before.stake);
  expect(afterWithdraw.eth).toBe(0n);

  // The injected wallet must not have been asked to sign or send anything, and its address stays out of the UI.
  expect(signingRequests).toEqual([]);
  await expect(page.getByText(account.address.slice(0, 6), { exact: false })).toHaveCount(0);
});
