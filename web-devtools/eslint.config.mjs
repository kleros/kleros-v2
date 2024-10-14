import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
import _import from "eslint-plugin-import";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["src/assets", "src/hooks/contracts/generated.ts", "src/graphql-generated/**/*.ts"],
  },
  ...fixupConfigRules(
    compat.extends(
      "next/core-web-vitals",
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:import/recommended",
      "plugin:import/react",
      "plugin:security/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
      "prettier"
    )
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      "react-hooks": fixupPluginRules(reactHooks),
      security: fixupPluginRules(security),
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },

      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "^16.12.0",
      },

      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },

        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },

    rules: {
      "max-len": [
        "warn",
        {
          code: 120,
        },
      ],

      "react/prop-types": 0,
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "(^_+[0-9]*$)|([iI]gnored$)|(^ignored)",
          argsIgnorePattern: "(^_+[0-9]*$)|([iI]gnored$)|(^ignored)",
        },
      ],

      "no-console": [
        "error",
        {
          allow: ["warn", "error", "info", "debug"],
        },
      ],

      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off",

      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      ],

      "import/no-unresolved": "off",

      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],

          pathGroups: [
            {
              pattern: "{react,styled-components}",
              group: "external",
              position: "before",
            },
            {
              pattern: "@kleros/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "{svgs/**,assets/**}",
              group: "internal",
              position: "after",
            },
            {
              pattern: "{hooks/**,utils/**,consts/**,types/**,context/**,connectors/**,}",
              group: "internal",
              position: "after",
            },
            {
              pattern: "{queries/**,}",
              group: "internal",
              position: "after",
            },
            {
              pattern: "{src/**,}",
              group: "internal",
              position: "after",
            },
            {
              pattern: "{styles/**,}",
              group: "internal",
              position: "after",
            },
            {
              pattern: "{layout/**,pages/**,components/**,}",
              group: "internal",
              position: "after",
            },
          ],

          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];
