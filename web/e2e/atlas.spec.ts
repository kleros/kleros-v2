import { expect, test, type Page } from "@playwright/test";

import { missingEnv } from "./env";
import { COURT_URL, connectButton } from "./helpers";
import { installMockWallet, MOCK_WALLET_NAME } from "./mockWallet";

const REQUIRED = [
  "REACT_APP_PRIVY_APP_ID",
  "REACT_APP_ATLAS_URI",
  "E2E_PRIVY_TEST_EMAIL",
  "E2E_PRIVY_TEST_OTP",
  "E2E_EXTERNAL_WALLET_PRIVATE_KEY",
  "ALCHEMY_API_KEY",
];

test.skip(missingEnv(REQUIRED).length > 0, `missing env: ${missingEnv(REQUIRED).join(", ")}`);

test.beforeAll(async () => {
  const atlas = process.env.REACT_APP_ATLAS_URI!;
  const ok = await fetch(`${atlas.replace(/\/$/, "")}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "{__typename}" }),
  })
    .then((r) => r.ok)
    .catch(() => false);
  test.skip(!ok, "Atlas is not reachable at REACT_APP_ATLAS_URI");
});

const openNotificationSettings = async (page: Page) => {
  await page
    .locator("button")
    .filter({ hasText: /^Settings$/ })
    .filter({ visible: true })
    .first()
    .click();
  await page.getByText("Notifications", { exact: true }).first().click();
};

const signInToAtlas = async (page: Page, approvePrivyModal: boolean) => {
  await openNotificationSettings(page);
  await page.getByRole("button", { name: "Sign In" }).click();
  if (approvePrivyModal) {
    const modal = page.locator("#privy-modal-content");
    await expect(modal).toContainText(/sign/i, { timeout: 60_000 });
    await page.screenshot({ path: "../odd/artifacts/task9/atlas-embedded-2-privy-sign.png" });
    await modal.getByRole("button", { name: /sign/i }).click();
  }
  await expect(page.getByText("Signed In successfully!")).toBeVisible({ timeout: 90_000 });
  await expect(page.locator("#privy-modal-content")).toBeHidden({ timeout: 30_000 });
  // The Notifications form is only rendered by EnsureAuth once the Atlas session is verified.
  // The Privy modal's outside click can dismiss the settings panel: reopen it if so.
  if (!(await page.getByText("Contact Details").isVisible())) await openNotificationSettings(page);
  await expect(page.getByText("Contact Details")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Sign In" })).toBeHidden();
};

test("Atlas SIWE sign-in with an external wallet", async ({ page }) => {
  await installMockWallet(page, process.env.E2E_EXTERNAL_WALLET_PRIVATE_KEY as `0x${string}`);
  await page.goto(COURT_URL);
  await connectButton(page).click();
  await page.getByText("Continue with a wallet").click();
  await page.getByText(MOCK_WALLET_NAME).first().click();
  await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({ timeout: 60_000 });

  await signInToAtlas(page, false);
  await page.screenshot({ path: "../odd/artifacts/task9/atlas-external-1-signed-in.png" });
});

test("Atlas SIWE sign-in with the embedded Privy wallet (Privy sign modal expected)", async ({ page }) => {
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
  await expect(page.locator("#privy-modal-content")).toBeHidden({ timeout: 30_000 });

  await signInToAtlas(page, true);
  await page.screenshot({ path: "../odd/artifacts/task9/atlas-embedded-3-signed-in.png" });
});
