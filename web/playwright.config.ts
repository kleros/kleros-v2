import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const MOCKED_PORT = 4173;
const LOCAL_STACK_URL = "http://localhost:5173";
const isLocalStackRun = process.argv.some((arg) => arg.includes("local-stack"));

export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  failOnFlakyTests: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [["list"], ["junit", { outputFile: "test-results/junit.xml" }], ["html", { open: "never" }], ["github"]]
    : [["line"], ["json", { outputFile: "test-results/results.json" }], ["html", { open: "never" }]],
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled", caret: "hide" },
  },
  // Visual baselines are rendered on Linux (Playwright docker image) only; see specs/visual/README.md.
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}",
  use: {
    locale: "en-US",
    timezoneId: "UTC",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "mocked",
      testIgnore: ["**/local-stack/**"],
      grepInvert: /@local-stack|@visual/,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${MOCKED_PORT}/#` },
    },
    {
      name: "visual",
      testIgnore: ["**/local-stack/**"],
      grep: /@visual/,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${MOCKED_PORT}/#` },
    },
    {
      // Needs `yarn local-stack` running (hardhat, graph-node, web on :5173); never run in PR CI.
      name: "local-stack",
      testMatch: ["**/local-stack/**/*.spec.ts"],
      grep: /@local-stack/,
      workers: 1,
      fullyParallel: false,
      use: { ...devices["Desktop Chrome"], baseURL: `${LOCAL_STACK_URL}/#` },
    },
  ],
  webServer: isLocalStackRun
    ? undefined
    : {
        command: "yarn e2e:serve",
        url: `http://localhost:${MOCKED_PORT}`,
        reuseExistingServer: !isCI,
        timeout: 300_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
