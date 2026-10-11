import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    exclude: [...configDefaults.exclude, "**/lib/**"],
    setupFiles: ["./test/setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: { junit: "test-results/junit.xml" },
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      // re-export barrels and type-only modules have no runtime statements
      exclude: [
        "src/**/*.d.ts",
        "src/types/**",
        "src/index.ts",
        "src/utils/index.ts",
        "src/dataMappings/index.ts",
        "src/dataMappings/utils/actionTypes.ts",
        "src/dataMappings/utils/disputeDetailsTypes.ts",
      ],
      reporter: ["text", "json-summary", "lcov"],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 95,
        lines: 90,
        "src/dataMappings/**": { statements: 90, branches: 80, functions: 95, lines: 90 },
        "src/utils/**": { statements: 90, branches: 80, functions: 100, lines: 90 },
        // requests/* keep a try/catch around a returned promise, so its error-mapping branches are unreachable
        "src/requests/**": { statements: 65, branches: 40, functions: 100, lines: 65 },
      },
    },
  },
});
