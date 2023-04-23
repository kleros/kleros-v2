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
  ],
};
