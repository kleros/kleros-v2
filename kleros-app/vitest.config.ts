import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "dist/**"],
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: { junit: "test-results/junit.xml" },
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.{ts,tsx}"],
      exclude: [
        "src/lib/**/*.test.{ts,tsx}",
        "src/lib/index.ts",
        "src/lib/atlas/index.ts",
        "src/lib/atlas/providers/index.ts",
      ],
      reporter: ["text", "json-summary", "lcov"],
      thresholds: {
        statements: 95,
        branches: 85,
        functions: 100,
        lines: 95,
        "src/lib/atlas/providers/**": { statements: 95, branches: 90, functions: 100, lines: 95 },
        "src/lib/atlas/utils/**": { statements: 95, branches: 75, functions: 100, lines: 95 },
      },
    },
  },
});
