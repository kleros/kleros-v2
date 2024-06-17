import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    rollupOptions: {
      onwarn: (warning, warn) => {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
  },
  envPrefix: ["REACT_APP", "ALCHEMY", "WALLETCONNECT_PROJECT_ID"],
  plugins: [
    svgr({
      include: ["**/*.svg", "tsx:**/*.svg"],
      exclude: ["../node_modules/**/*"],
    }),
    tsconfigPaths({
      ignoreConfigErrors: true,
    }),
    nodePolyfills({
      include: ["fs", "stream"],
    }),
  ],
});
