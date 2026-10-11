import { expect, test as base } from "@playwright/test";

const APP_ORIGIN = /^http:\/\/localhost:4173\//;

// Third-party SDK traffic the app never reads back (Reown AppKit, WalletConnect, Coinbase SDK, Sentry).
// Google Fonts is stubbed too so text renders in the same fallback font everywhere.
const STUBBED = [
  /^fonts\.(googleapis|gstatic)\.com\//,
  /(^|\.)web3modal\.(org|com)\//,
  /(^|\.)walletconnect\.(org|com)\//,
  /(^|\.)reown\.com\//,
  /(^|\.)coinbase\.com\//,
  /(^|\.)sentry\.io\//,
];

export type NetworkFixture = {
  /** Requests no fixture answered; the test fails at teardown if this is non-empty. */
  unhandled: string[];
};

export const test = base.extend<{ network: NetworkFixture }>({
  network: [
    async ({ context }, use) => {
      const unhandled: string[] = [];

      // Context routes are consulted after page routes, so this only sees what no fixture claimed.
      await context.route("**/*", (route) => {
        const request = route.request();
        const url = request.url();
        if (APP_ORIGIN.test(url) || url.startsWith("data:")) return route.continue();
        if (STUBBED.some((re) => re.test(url.replace(/^\w+:\/\//, "")))) return route.fulfill({ status: 204 });
        unhandled.push(`${request.method()} ${url}`);
        return route.abort("blockedbyclient");
      });

      // viem transports fall back from http to wss; nothing in the mocked app may open a socket.
      await context.routeWebSocket(/.*/, (ws) => {
        const url = ws.url();
        if (!STUBBED.some((re) => re.test(url.replace(/^\w+:\/\//, "")))) unhandled.push(`WS ${url}`);
        ws.close();
      });

      await use({ unhandled });

      expect(unhandled, "unmocked network calls; add a handler in fixtures/ or mocks/").toEqual([]);
    },
    { auto: true, box: true },
  ],
});
