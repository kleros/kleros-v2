module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "@kleros/kleros-v2-tsconfig/base.json",
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true,
    es2020: true,
  },
  plugins: ["@typescript-eslint", "prettier", "import"],
  rules: {
    "no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "_",
        argsIgnorePattern: "_",
      },
    ],
    "prettier/prettier": "error",
    "import/no-unresolved": [
      "error",
      {
        commonjs: true,
      },
    ],
    "node/no-unsupported-features/es-syntax": [
      "error",
      {
        ignores: ["modules"],
      },
    ],
    "node/no-missing-import": [
      "error",
      {
        tryExtensions: [".js", ".ts", ".json", ".node"],
      },
    ],
    "@typescript-eslint/no-floating-promises": [
      "error",
      {
        ignoreIIFE: true,
        ignoreVoid: true,
      },
    ],
    "@typescript-eslint/no-inferrable-types": "off",
  },
};
