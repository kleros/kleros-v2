import { expect, test } from "./fixtures";

/**
 * Bootstrap for Playwright test agents (planner/generator/healer, `npx playwright init-agents`).
 * Every fixture is active: strict network, schema-first subgraph mock with the default world
 * (mocks/subgraph/world.ts), JSON-RPC mock with default contract reads (mocks/rpc/defaults.ts),
 * Atlas, IPFS, prices and a clock pinned to builders/types.ts E2E_NOW.
 */
test("seed", async ({ page, wallet }) => {
  await page.goto("/");
  await wallet.connect("alice");
  await expect(page.getByRole("heading", { name: "Court Overview" })).toBeVisible();
});
