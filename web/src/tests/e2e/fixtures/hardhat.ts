import { test as base } from "@playwright/test";
import { createTestClient, http, publicActions, walletActions } from "viem";
import { hardhat } from "viem/chains";

const client = createTestClient({
  chain: hardhat,
  mode: "hardhat",
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions);

export const test = base.extend<{ hardhat: typeof client }>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hardhat: async ({ page }, use) => {
    await use(client);
  },
});
