import { mergeTests } from "@playwright/test";

import { test as atlasTest } from "./atlas";
import { test as clockTest } from "./clock";
import { test as ipfsTest } from "./ipfs";
import { test as lifiTest } from "./lifi";
import { test as networkTest } from "./network";
import { test as pricesTest } from "./prices";
import { test as rpcTest } from "./rpc";
import { test as subgraphTest } from "./subgraph";
import { test as walletTest, WalletFixture } from "./wallet";

export { expect } from "@playwright/test";

/** The mocked-project test: strict network plus a mock for every service the app calls. */
export const test = mergeTests(
  networkTest,
  clockTest,
  subgraphTest,
  rpcTest,
  atlasTest,
  ipfsTest,
  pricesTest,
  lifiTest,
  walletTest
).extend({
  // The mock connector asks the chain for eth_accounts, so the RPC mock must report the connected key.
  wallet: async ({ page, rpc }, use) => {
    await use(new WalletFixture({ page, onConnect: (address) => (rpc.accounts = [address]) }));
  },
});
