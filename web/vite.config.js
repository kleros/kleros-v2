import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import eruda from "vite-plugin-eruda";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
    viteStaticCopy({
      targets: [
        {
          src: [
            resolve(__dirname, "../node_modules/@shutter-network/shutter-sdk/dist/blst.js"),
            resolve(__dirname, "../node_modules/@shutter-network/shutter-sdk/dist/blst.wasm"),
          ],
          dest: ".",
        },
      ],
    }),
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
    eruda(),
  ],
});
