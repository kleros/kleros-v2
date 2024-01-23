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
      files: ["*.sol"],
      options: {
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: false,
        explicitTypes: "preserve",
      },
    },
  ],
};
