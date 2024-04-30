import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: "src",
  envPrefix: ["REACT_APP", "ALCHEMY"],
  plugins: [
    svgr({
      include: ["**/*.svg", "tsx:**/*.svg"],
    }),
    tsconfigPaths({
      ignoreConfigErrors: true,
    }),
    nodePolyfills(),
  ],
});
