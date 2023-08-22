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
  extends: ["eslint:recommended", "plugin:prettier/recommended", "plugin:import/recommended"],
  plugins: ["@typescript-eslint", "prettier", "import"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      parserOptions: {
        project: ["./tsconfig.json"],
      },
      rules: {
        "@typescript-eslint/return-await": ["error", "always"],
      },
    },
  ],
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
    "no-return-await": "off",
  },
};
