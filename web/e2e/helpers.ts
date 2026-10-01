import { expect, type Page } from "@playwright/test";
import { parseEther, type Address } from "viem";

import { snapshot } from "./chain";

export const COURT_URL = "/#/courts/1";

const DEPLOYED_ORIGIN = "https://kleros-university-web2.netlify.app";

/**
 * Privy only accepts the deployed origin (API origin check and SIWE message domain), so a localhost page cannot log in.
 * Serves the site under test from the deployed origin by proxying its requests to the local server, and returns the URL to open.
 */
export const openAsDeployedOrigin = async (page: Page, path: string = COURT_URL) => {
  const local = process.env.E2E_BASE_URL ?? "http://localhost:5173";
  await page.route(`${DEPLOYED_ORIGIN}/**`, async (route) => {
    const { pathname, search } = new URL(route.request().url());
    await route.fulfill({ response: await route.fetch({ url: `${local}${pathname}${search}` }) });
  });
  await page.goto(`${DEPLOYED_ORIGIN}${path}`);
};

/** Records any text shown inside the Privy modal. The hidden Privy iframe is not part of #privy-modal-content. */
export const watchPrivyModal = async (page: Page) => {
  await page.evaluate(() => {
    const w = window as unknown as { __privySeen: string[]; __privyWatch?: number };
    w.__privySeen = [];
    if (w.__privyWatch) clearInterval(w.__privyWatch);
    w.__privyWatch = window.setInterval(() => {
      const el = document.querySelector("#privy-modal-content");
      const text = el && (el as HTMLElement).offsetParent !== null ? (el as HTMLElement).innerText.trim() : "";
      if (text) w.__privySeen.push(text.slice(0, 200));
    }, 50);
  });
};

export const privyModalSightings = (page: Page) =>
  page.evaluate(() => (window as unknown as { __privySeen?: string[] }).__privySeen ?? []);

export const connectButton = (page: Page) => page.getByRole("button", { name: "Connect", exact: true }).first();

export const waitUntil = async <T>(fn: () => Promise<T>, ok: (v: T) => boolean, timeout = 120_000) => {
  const start = Date.now();
  let last = await fn();
  while (!ok(last) && Date.now() - start < timeout) {
    await new Promise((r) => setTimeout(r, 3000));
    last = await fn();
  }
  return last;
};

const amountInput = (page: Page) => page.getByPlaceholder(/Amount to (stake|withdraw)/);

/** Types an amount in the StakePanel, waits for simulation (button enabled) and clicks the action button. */
export const stakeAction = async (page: Page, action: "Stake" | "Withdraw", amount: string) => {
  await page
    .locator("button[class*=BaseTag]")
    .filter({ hasText: new RegExp(`^${action}$`) })
    .click();
  const input = amountInput(page);
  // The field is read-only until focused, then it re-mounts as an editable input.
  await input.click();
  await input.fill(amount);
  const button = page.locator("button[class*=BaseButton]").filter({ hasText: new RegExp(`^${action}$`) });
  await expect(button).toBeEnabled({ timeout: 60_000 });
  await button.click();
};

/** Runs a stake/withdraw and waits until the on-chain stake reaches `expected`. */
export const stakeAndVerify = async (
  page: Page,
  address: Address,
  action: "Stake" | "Withdraw",
  amount: string,
  expected: bigint
) => {
  await stakeAction(page, action, amount);
  const after = await waitUntil(
    () => snapshot(address),
    (s) => s.stake === expected
  );
  expect(after.stake).toBe(expected);
  return after;
};

export const ONE_PNK = parseEther("1");
