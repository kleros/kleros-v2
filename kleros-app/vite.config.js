// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true }),
    nodePolyfills({
      include: ["fs", "stream"],
    }),
  ],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "kleros-app",
      fileName: "kleros-app",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react", "react-dom", "viem", "@tanstack/react-query", "graphql", "graphql-request"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@tanstack/react-query": "@tanstack/react-query",
          "graphql-request": "graphql-request",
        },
      },
    },
  },
});
