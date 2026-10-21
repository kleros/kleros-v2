import { expect, test, type Page } from "@playwright/test";

import { missingEnv } from "./env";
import { connectButton, openAsDeployedOrigin } from "./helpers";
import { installMockWallet, MOCK_WALLET_NAME } from "./mockWallet";

const privyModal = (page: Page) => page.locator("#privy-modal-content");

/** Settings > General > Disconnect, then Connect must open the Privy login modal again. */
const disconnectFromSettings = async (page: Page) => {
  await page
    .locator("button")
    .filter({ hasText: /^Settings$/ })
    .filter({ visible: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Disconnect", exact: true }).click();
  await expect(connectButton(page)).toBeVisible({ timeout: 30_000 });
  // The settings panel overlay covers the page: click outside it, as a user would.
  await page.mouse.click(20, 500);
};

test.describe("Disconnect from Settings, then Connect", () => {
  test("external wallet: Connect opens the Privy modal and reconnects", async ({ page }) => {
    const REQUIRED = ["REACT_APP_PRIVY_APP_ID", "E2E_EXTERNAL_WALLET_PRIVATE_KEY"];
    test.skip(missingEnv(REQUIRED).length > 0, `missing env: ${missingEnv(REQUIRED).join(", ")}`);
    await installMockWallet(page, process.env.E2E_EXTERNAL_WALLET_PRIVATE_KEY as `0x${string}`);

    await openAsDeployedOrigin(page);
    await connectButton(page).click();
    await page.getByText("Continue with a wallet").click();
    await page.getByText(MOCK_WALLET_NAME).first().click();
    await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 60_000 });
    await expect(privyModal(page)).toBeHidden({ timeout: 30_000 });

    await disconnectFromSettings(page);

    await connectButton(page).click();
    await expect(privyModal(page)).toBeVisible({ timeout: 30_000 });

    await page.getByText("Continue with a wallet").click();
    await page.getByText(MOCK_WALLET_NAME).first().click();
    await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 60_000 });
  });

  test("embedded Privy email account: Connect opens the Privy modal after Disconnect", async ({ page }) => {
    const REQUIRED = ["REACT_APP_PRIVY_APP_ID", "E2E_PRIVY_TEST_EMAIL", "E2E_PRIVY_TEST_OTP"];
    test.skip(missingEnv(REQUIRED).length > 0, `missing env: ${missingEnv(REQUIRED).join(", ")}`);

    await openAsDeployedOrigin(page);
    await connectButton(page).click();
    await page.getByPlaceholder("your@email.com").fill(process.env.E2E_PRIVY_TEST_EMAIL!);
    await page.getByRole("button", { name: "Submit" }).click();
    const otp = process.env.E2E_PRIVY_TEST_OTP!;
    const digits = privyModal(page).locator("input");
    await expect(digits).toHaveCount(otp.length);
    for (const [i, digit] of [...otp].entries()) {
      await digits.nth(i).click();
      await page.keyboard.press(digit);
    }
    await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 90_000 });
    await expect(privyModal(page)).toBeHidden({ timeout: 30_000 });

    await disconnectFromSettings(page);

    await connectButton(page).click();
    await expect(privyModal(page)).toBeVisible({ timeout: 30_000 });
  });
});
