import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts", "@testing-library/jest-dom/vitest"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // The library's entry imports its stylesheet; let Vite process it instead of Node.
    server: { deps: { inline: ["@kleros/ui-components-library"] } },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
