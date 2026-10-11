import { mergeTests } from "@playwright/test";

import type { World } from "../mocks/subgraph/world";

import { test as networkTest } from "./network";
import { test as subgraphTest } from "./subgraph";

const GATEWAY = "https://ipfs.e2e.test";

export type IpfsFixture = {
  /** Gateway path (`/ipfs/<cid>/<file>`) to a JSON body or raw text; overrides the generated defaults. */
  files: Map<string, unknown>;
};

/** Policies the subgraph builders point at: `/ipfs/QmCourtPolicy<courtId>/...` and `/ipfs/QmDisputePolicy<id>/...`. */
const generated = (path: string, world: World): unknown => {
  const court = path.match(/^\/ipfs\/QmCourtPolicy(\d+)\/policy\.json$/);
  if (court) {
    const name = world.courts.find((c) => c.id === court[1])?.name ?? `Court ${court[1]}`;
    return {
      name,
      description: `Purpose of the ${name}.`,
      summary: `Policy summary of the ${name}.`,
      requiredSkills: `Skills required by the ${name}.`,
    };
  }
  if (/^\/ipfs\/QmDisputePolicy\d+\/policy\.json$/.test(path)) return { name: "Dispute policy" };
  return undefined;
};

export const test = mergeTests(networkTest, subgraphTest).extend<{ ipfs: IpfsFixture }>({
  ipfs: [
    async ({ page, network, subgraph }, use) => {
      const files = new Map<string, unknown>();
      await page.route(`${GATEWAY}/**`, (route) => {
        const path = new URL(route.request().url()).pathname;
        // hooks/queries/useCourtPolicy.ts fetches the bare gateway while the court query is still loading.
        if (path === "/") return route.fulfill({ status: 404 });
        const body = files.has(path) ? files.get(path) : generated(path, subgraph.world);
        if (body === undefined) {
          network.unhandled.push(`IPFS ${path}`);
          return route.fulfill({ status: 404 });
        }
        return typeof body === "string" ? route.fulfill({ body }) : route.fulfill({ json: body });
      });
      await use({ files });
    },
    { auto: true, box: true },
  ],
});
