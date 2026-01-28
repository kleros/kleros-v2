import { UserRejectedRequestError } from "viem";

import { expect, test } from "./fixtures";

test.describe("Wallet tests", () => {
  test("should connect wallet", async ({ page, wallet }) => {
    await page.goto("/");

    await wallet.connect("alice");
    const connectedAddress = wallet.address;

    expect(connectedAddress).toBeDefined();
    await expect(page.getByRole("button", { name: connectedAddress! })).toBeVisible();
  });

  test("should throw when wallet connection is rejected by user", async ({ page, wallet }) => {
    await page.goto("/");

    await wallet.connect("alice", {
      connectError: new UserRejectedRequestError(new Error("User rejected request.")),
    });

    // reown doesn't bubble the rejection error while connecting wallet
    await expect(page.getByText("Connection declined")).toBeVisible();
  });
});
