import { expect, test } from "../../fixtures";

test.describe("notification settings", () => {
  test("subscribes a new email through Atlas", async ({ page, wallet, atlas }) => {
    await page.goto("/");
    await wallet.connect("alice");

    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("tab", { name: "Notifications" }).click();
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("textbox", { name: /Email/ }).fill("juror@example.com");
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(() => atlas.user?.email).toBe("juror@example.com");
    expect(atlas.operations.find((o) => o.operationName === "AddUser")?.variables).toEqual({
      settings: { email: "juror@example.com", product: "CourtV2" },
    });
  });

  test("rejects an invalid email", async ({ page, wallet }) => {
    await page.goto("/");
    await wallet.connect("alice");

    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("tab", { name: "Notifications" }).click();
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("textbox", { name: /Email/ }).fill("not-an-email");

    await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("confirms an email from the verification link", async ({ page, atlas }) => {
    await page.goto(
      "/#/settings/email-confirmation?address=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266&token=e2e-token"
    );

    await expect(page.getByText(/confirmed|verified/i).first()).toBeVisible();
    expect(atlas.operations.find((o) => o.operationName === "ConfirmEmail")?.variables).toEqual({
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      token: "e2e-token",
    });
  });
});
