// The shared config on master is legacy (.eslintrc.js) only; this is the flat-config wrapper that the shared
// package's `flat.config.mjs` provides on dev. Replace this file with
// `export { default } from "@kleros/kleros-v2-eslint-config/flat.config.mjs";` once that lands here.
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const require = createRequire(import.meta.url);
const legacyConfigPath = require.resolve("@kleros/kleros-v2-eslint-config");
const legacy = require(legacyConfigPath);
// Mirrors the dev version of the shared config: TypeScript-aware unused-vars, the TypeScript import resolver,
// max-len 120, and no `node/*` rules (they name a plugin master's config never declares).
const { "no-unused-vars": unusedVars, ...legacyRules } = legacy.rules;
const legacyConfig = {
  ...legacy,
  rules: {
    ...Object.fromEntries(Object.entries(legacyRules).filter(([rule]) => !rule.startsWith("node/"))),
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": unusedVars,
    "max-len": ["warn", { code: 120 }],
  },
  settings: {
    "import/resolver": {
      typescript: { project: "./tsconfig.json" },
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    },
  },
};

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
  resolvePluginsRelativeTo: path.dirname(legacyConfigPath),
  recommendedConfig: js.configs.recommended,
});

export default [...compat.config(legacyConfig)];
