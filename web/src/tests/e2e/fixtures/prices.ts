import { test as base } from "@playwright/test";

export const PRICES = { "coingecko:kleros": 0.02, "coingecko:ethereum": 3000 };

/** DefiLlama prices used for USD conversions (hooks/useCoinPrice.tsx). */
export const test = base.extend<{ prices: typeof PRICES }>({
  prices: [
    async ({ page }, use) => {
      const prices = { ...PRICES };
      await page.route("https://coins.llama.fi/prices/current/**", (route) =>
        route.fulfill({
          json: {
            coins: Object.fromEntries(
              Object.entries(prices).map(([id, price]) => [id, { price, symbol: id, timestamp: 0, confidence: 1 }])
            ),
          },
        })
      );
      await use(prices);
    },
    { auto: true, box: true },
  ],
});
