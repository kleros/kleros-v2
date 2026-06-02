module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true,
    es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
  ],
  plugins: ["@typescript-eslint", "prettier", "import", "n"],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "(^_+[0-9]*$)|([iI]gnored$)|(^ignored)",
        argsIgnorePattern: "(^_+[0-9]*$)|([iI]gnored$)|(^ignored)",
      },
    ],
    "prettier/prettier": "error",
    "import/no-unresolved": [
      "error",
      {
        commonjs: true,
      },
    ],
    "n/no-unsupported-features/es-syntax": [
      "error",
      {
        ignores: ["modules"],
      },
    ],
    "n/no-missing-import": "off",
  },
  settings: {
    "import/resolver": {
      typescript: { project: "./tsconfig.json" },
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    },
  },
};
