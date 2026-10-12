import { test as base } from "@playwright/test";

/** Empty LI.FI catalogue so the Get PNK widget renders without bridging/swap routes. */
export const test = base.extend<{ lifi: void }>({
  lifi: [
    async ({ page }, use) => {
      await page.route("https://li.quest/v1/**", (route) => {
        const { pathname } = new URL(route.request().url());
        if (pathname.endsWith("/chains")) return route.fulfill({ json: { chains: [] } });
        if (pathname.endsWith("/tools")) return route.fulfill({ json: { bridges: [], exchanges: [] } });
        if (pathname.endsWith("/tokens")) return route.fulfill({ json: { tokens: {} } });
        if (pathname.endsWith("/token")) {
          const params = new URL(route.request().url()).searchParams;
          return route.fulfill({
            json: {
              address: params.get("token"),
              chainId: Number(params.get("chain")),
              symbol: "PNK",
              name: "Kleros",
              decimals: 18,
              priceUSD: "0.02",
            },
          });
        }
        return route.fallback();
      });
      await use();
    },
    { auto: true, box: true },
  ],
});
