import type { Page } from "@playwright/test";
import { test as base } from "@playwright/test";
import type { MockParameters } from "@wagmi/core";
import type { Address, Hex } from "viem";
import { privateKeyToAddress } from "viem/accounts";

import { ACCOUNT_PKEYS } from "../utils";

export class WalletFixture {
  address?: Address;
  private page: Page;

  constructor({ page }: { page: Page }) {
    this.page = page;
  }

  async connect(name: keyof typeof ACCOUNT_PKEYS, features?: MockParameters["features"]) {
    const privateKey = ACCOUNT_PKEYS[name];
    const address = privateKeyToAddress(privateKey);

    this.address = address;

    await this.setup(address, features);
    await this.login();
  }

  // takes the address and attaches a mock connect to reown/wagmi's connectors.
  // see wagmi.ts/createMockAdapter and context/Web3Provider.tsx for implementation of window._setupMockAccount.
  private async setup(...args: [Hex, MockParameters["features"]]) {
    await this.page.waitForFunction(() => window._setupMockAccount);

    await this.page.evaluate((args) => window._setupMockAccount(...args), args);
  }

  // This is our app specific, how we connect to the wallet
  // TODO: claim pnk for the account?
  private async login() {
    // click connect button on the navbar
    await this.page.getByRole("button", { name: "Connect" }).click();
    // choose the mock connector
    await this.page.getByRole("button", { name: "Mock Connector" }).click();
  }
}

export const test = base.extend<{ wallet: WalletFixture }>({
  wallet: async ({ page }, use) => {
    await use(new WalletFixture({ page }));
  },
});
