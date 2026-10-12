import { mergeTests, type Route } from "@playwright/test";

import { installDefaultCalls } from "../mocks/rpc/defaults";
import { RpcServer } from "../mocks/rpc/server";

import { test as clockTest } from "./clock";
import { test as networkTest } from "./network";

/** RPC URLs the mocked build talks to, by chain id. The wagmi mock connector posts writes to the chain's public RPC. */
const ENDPOINTS: [string, number][] = [
  ["https://arb-sepolia.g.alchemy.com/v2/**", 421614],
  ["https://sepolia-rollup.arbitrum.io/rpc", 421614],
  ["https://eth-mainnet.g.alchemy.com/v2/**", 1],
];

export const test = mergeTests(networkTest, clockTest).extend<{ rpc: RpcServer }>({
  rpc: [
    async ({ page, network, now }, use) => {
      const rpc = new RpcServer(network.unhandled, () => now);
      installDefaultCalls(rpc);
      const answer = async (route: Route, chainId: number) => {
        const request = route.request();
        const body = request.postDataJSON();
        if (!body) {
          network.unhandled.push(`${request.method()} ${request.url()} (no JSON-RPC body)`);
          return route.fulfill({ status: 400 });
        }
        return route.fulfill({ json: await rpc.respond(chainId, body) });
      };
      for (const [glob, chainId] of ENDPOINTS) await page.route(glob, (route) => answer(route, chainId));
      // AppKit rewrites each network's default RPC to its own proxy, which the mock connector posts writes to.
      // Its GET metadata endpoints fall through to the network fixture's WalletConnect stub.
      await page.route("https://rpc.walletconnect.org/v1/**", (route) =>
        route.request().method() === "POST"
          ? answer(route, Number(new URL(route.request().url()).searchParams.get("chainId")?.split(":")[1]))
          : route.fallback()
      );
      await use(rpc);
    },
    { auto: true, box: true },
  ],
});
