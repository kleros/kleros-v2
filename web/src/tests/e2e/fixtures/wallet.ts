import type { Page } from "@playwright/test";
import { expect, test as base } from "@playwright/test";
import type { MockParameters } from "@wagmi/core";
import type { Address } from "viem";
import { privateKeyToAddress } from "viem/accounts";

import { ACCOUNT_PKEYS, type AccountKey } from "../utils/accounts";

export class WalletFixture {
  address?: Address;
  private page: Page;
  private onConnect?: (address: Address) => void;

  constructor({ page, onConnect }: { page: Page; onConnect?: (address: Address) => void }) {
    this.page = page;
    this.onConnect = onConnect;
  }

  /**
   * Connects a wagmi `mock` connector through the app's Connect button. Signatures are produced by the
   * RPC mock (mocked project) or the hardhat node (local-stack) for the same well-known keys.
   * `chainId` makes the wallet connect on another network, for wrong-network states.
   */
  async connect(name: AccountKey, features?: MockParameters["features"], chainId?: number) {
    const address = privateKeyToAddress(ACCOUNT_PKEYS[name]);
    this.address = address;
    this.onConnect?.(address);

    // See config/wagmi.ts createMockAdapter and context/Web3Provider.tsx; only e2e and local builds expose it.
    await this.page.waitForFunction(() => window._setupMockAccount);
    await this.page.evaluate((args) => window._setupMockAccount(...args), [address, features, chainId] as const);

    // The header button comes first; EnsureChain renders more "Connect" buttons inside some pages.
    await this.page.getByRole("button", { name: "Connect" }).first().click();
    await this.page.getByRole("button", { name: "Mock Connector" }).click();
    if (!features?.connectError && !chainId)
      await expect(this.page.getByRole("button", { name: address })).toBeVisible();
    return address;
  }
}

export const test = base.extend<{ wallet: WalletFixture }>({
  wallet: async ({ page }, use) => {
    await use(new WalletFixture({ page }));
  },
});
