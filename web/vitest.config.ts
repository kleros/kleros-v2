import { fileURLToPath } from "url";

import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

import { TEST_ENV } from "./src/test/env";

export default defineConfig({
  plugins: [
    svgr({
      include: ["**/*.svg", "tsx:**/*.svg"],
      exclude: ["../node_modules/**/*"],
    }),
    tsconfigPaths({ ignoreConfigErrors: true }),
  ],
  resolve: {
    // @kleros/kleros-app ships only a "module" entry (no "main"/"exports").
    mainFields: ["module", "jsnext:main", "jsnext"],
    alias: [
      // Written by scripts/gitInfo.js at build time only; tests use a fixed stub.
      {
        find: /^\.\.\/generatedGitInfo\.json$/,
        replacement: fileURLToPath(new URL("./src/test/stubs/gitInfo.json", import.meta.url)),
      },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    env: TEST_ENV,
    setupFiles: ["./src/test/setup.ts", "@testing-library/jest-dom/vitest"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: { junit: "test-results/junit.xml" },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/graphql/**",
        "src/hooks/contracts/generated.ts",
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/tests/**",
        "src/assets/**",
        "src/locales/**",
        "src/**/*.d.ts",
      ],
      reporter: ["text-summary", "json-summary", "html", "lcov"],
      thresholds: {},
    },
  },
});
