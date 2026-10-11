import { cleanup } from "@testing-library/react";
import { vi, beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import "@testing-library/jest-dom/vitest";

import "./i18n";
import { server } from "./msw/server";

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

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});
