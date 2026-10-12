import { test as base } from "@playwright/test";

import { E2E_NOW } from "../builders/types";

export type ClockOptions = {
  /** Browser time (ms since epoch) installed before the first navigation; builders date entities from it. */
  now: number;
};

export const test = base.extend<ClockOptions & { clock: void }>({
  now: [E2E_NOW, { option: true }],
  clock: [
    async ({ page, now }, use) => {
      // Timers keep running from `now`, so the GraphQL batch window and polling still fire.
      await page.clock.install({ time: now });
      await use();
    },
    { auto: true, box: true },
  ],
});
