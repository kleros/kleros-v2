module.exports = {
  htmlWhitespaceSensitivity: "css",
  printWidth: 120,
  trailingComma: "all",
  endOfLine: "lf",
  overrides: [
    {
      files: ["*.json"],
      options: {
        parser: "json-stringify",
      },
    },
    {
      files: ["*.sol"],
      options: {
        compiler: "0.8.18",
        parser: "solidity-parse",
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: false,
        explicitTypes: "preserve",
      },
    },
    {
      files: ["*.ts"],
      options: {
        parser: "typescript",
        importOrder: ["<THIRD_PARTY_MODULES>", "^[./]"],
        importOrderParserPlugins: ["typescript"],
        importOrderSeparation: true,
        importOrderSortSpecifiers: true,
      },
    },
  ],
};
