module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: ["standard", "plugin:prettier/recommended", "plugin:node/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // "node/no-unsupported-features/es-syntax": ["error", { ignores: ["modules"] }],
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-unsupported-features/node-builtins": "off",
    camelcase: "off",
    "node/no-missing-import": "off",
    "import/no-unresolved": "off",
    "node/no-extraneous-import": "off",
  },
  settings: {
    "import/resolver": { node: { extensions: [".ts"] } },
  },
};
