import { expect, test as base } from "@playwright/test";

import {
  executeSubgraphQuery,
  type RootResolvers,
  type SubgraphCall,
  type SubgraphName,
} from "../mocks/subgraph/executor";
import { coreResolvers, defaultWorld, drtResolvers, type World } from "../mocks/subgraph/world";

const ENDPOINTS: Record<SubgraphName, string> = {
  core: "https://subgraph.e2e.test/core",
  drt: "https://subgraph.e2e.test/drt",
};

export type SubgraphFixture = {
  /** Mutable dataset behind the default resolvers; edit it before or after `page.goto`. */
  world: World;
  /** Overrides root fields (`dispute`, `disputes`, ...) for one subgraph; later calls win. */
  use(resolvers: RootResolvers, subgraph?: SubgraphName): void;
  /** Answers every request to `subgraph` with an HTTP error, like an unreachable indexer. */
  fail(subgraph?: SubgraphName, status?: number): void;
  /** Root fields the app queried, with arguments, in order. */
  calls: SubgraphCall[];
};

export const test = base.extend<{ subgraph: SubgraphFixture }>({
  subgraph: [
    async ({ page }, use) => {
      const world = defaultWorld();
      const overrides: Record<SubgraphName, RootResolvers> = { core: {}, drt: {} };
      const failing = new Map<SubgraphName, number>();
      const calls: SubgraphCall[] = [];
      const errors: string[] = [];

      for (const name of Object.keys(ENDPOINTS) as SubgraphName[]) {
        await page.route(ENDPOINTS[name], async (route) => {
          const status = failing.get(name);
          if (status) return route.fulfill({ status, json: { errors: [{ message: "e2e: subgraph unavailable" }] } });
          const defaults = name === "core" ? coreResolvers(world) : drtResolvers(world);
          const result = executeSubgraphQuery(
            name,
            route.request().postDataJSON(),
            { ...defaults, ...overrides[name] },
            calls
          );
          errors.push(...(result.errors ?? []).map((e) => `${name}: ${e.message}`));
          return route.fulfill({ json: result });
        });
      }

      await use({
        world,
        calls,
        use: (resolvers, subgraph = "core") => Object.assign(overrides[subgraph], resolvers),
        fail: (subgraph = "core", status = 500) => void failing.set(subgraph, status),
      });

      expect(errors, "subgraph mock could not answer a query; fix the builder or add a resolver").toEqual([]);
    },
    { auto: true, box: true },
  ],
});
