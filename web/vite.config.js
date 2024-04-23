import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    svgr({
      include: ["**/*.svg", "tsx:**/*.svg"],
    }),
    tsconfigPaths({
      ignoreConfigErrors: true,
    }),
  ],
});
