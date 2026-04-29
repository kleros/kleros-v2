//ESLint 9 requires flat config (eslint.config.*) and no longer reads legacy .eslintrc files automatically.
//This file just migrates the legacy @kleros/kleros-v2-eslint-config to the new format, according to the docs.
//For workspaces that don't need custom rules, a simple eslint.config.mjs that just exports:
//export { default } from "@kleros/kleros-v2-eslint-config/flat.config.mjs";
//is enough to provide access to the default eslint config for that workspace.
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import legacyConfig from "./.eslintrc.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [...compat.config(legacyConfig)];
