import { cleanup, waitFor } from "@testing-library/react";
import { vi, beforeAll, beforeEach, afterEach, afterAll, expect } from "vitest";
import "@testing-library/jest-dom/vitest";

import "./i18n";
import { server } from "./msw/server";
import { activeQueryClients } from "./queryClients";

// The Reown modal hooks throw unless config/wagmi ran createAppKit; tests use the wagmi mock connector instead.
vi.mock("@reown/appkit/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@reown/appkit/react")>()),
  useAppKit: () => ({ open: vi.fn(), close: vi.fn() }),
  useAppKitState: () => ({ open: false, loading: false, initialized: true }),
}));

// In-memory localStorage so tests can assert on persisted values without jsdom's origin quirks.
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});

// @stitches/core (via the MDX editor) inserts `--sxs{...}` marker rules that jsdom's CSSOM rejects;
// insert an equivalent valid rule so stitches' rule indexes stay aligned.
const insertRule = CSSStyleSheet.prototype.insertRule;
CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
  return insertRule.call(this, rule.startsWith("--sxs{") ? rule.replace("--sxs{", "[data-sxs]{") : rule, index);
};

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

afterEach(async () => {
  cleanup();
  // Batched subgraph queries outlive unmount; let them land on this test's handlers, not the next test's.
  for (const client of activeQueryClients) {
    await waitFor(() => expect(client.isFetching() + client.isMutating()).toBe(0));
    client.clear();
  }
  activeQueryClients.clear();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});
