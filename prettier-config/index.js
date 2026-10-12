module.exports = {
  htmlWhitespaceSensitivity: "css",
  printWidth: 120,
  trailingComma: "es5",
  endOfLine: "lf",
  overrides: [
    {
      files: ["*.json"],
      options: {
        parser: "json-stringify",
      },
    },
    {
      // json-stringify rejects comments.
      files: ["tsconfig*.json"],
      options: {
        parser: "json",
      },
    },
    {
      // Dispute templates get pasted into strict JSON parsers.
      files: ["*.jsonc"],
      options: {
        trailingComma: "none",
      },
    },
    {
      files: ["*.sol"],
      options: {
        parser: "solidity-parse",
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: false,
      },
    },
  ],
  plugins: ["prettier-plugin-solidity"],
};
