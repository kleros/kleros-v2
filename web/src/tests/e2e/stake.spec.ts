import { expect, test } from "./fixtures";

test.describe("Stake tests", () => {
  test("should set stake by alice", async ({ page, wallet }) => {
    await page.goto("/");
    // note that alice being the first account and deployer already has the PNK
    await wallet.connect("alice");

    // go to general court page
    await page.goto("/#/courts");

    // locale is set to english by default in config
    const input = page.getByPlaceholder("Amount to stake");
    await input.click();
    await page.keyboard.type("10000");

    await page.getByTestId("stake-withdraw-button").click();

    // Step 1: staking in progress
    await expect(page.getByText("You are staking")).toBeVisible();

    await expect(page.getByText("Approve in wallet")).toBeVisible();
    await expect(page.getByText("PNK spending")).toBeVisible();
    await expect(page.getByText("Stake in wallet")).toBeVisible();

    // Step 2: success
    await expect(page.getByText("You successfully staked")).toBeVisible({ timeout: 30_000 });
  });
});
