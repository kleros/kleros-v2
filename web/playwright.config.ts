import path from "path";

import { defineConfig } from "@playwright/test";

import { loadEnv } from "./e2e/env";

loadEnv();

// Runs against an already-running site (see `yarn test:e2e` notes in e2e/README.md).
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  timeout: 240_000,
  expect: { timeout: 30_000 },
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  outputDir: path.resolve(process.cwd(), "../odd/artifacts/task9/test-results"),
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    channel: "chrome",
    headless: true,
    viewport: { width: 1280, height: 900 },
    screenshot: "on",
    trace: "on",
  },
});
