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
  plugins: ["@typescript-eslint", "prettier", "import"],
  rules: {
    "no-unused-vars": [
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
  },
};
