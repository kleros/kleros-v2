/* eslint-disable node/no-extraneous-require */

const shell = require("shelljs");

// The environment variables are loaded in hardhat.config.ts

module.exports = {
  istanbulReporter: ["html"],
  onCompileComplete: async function (_config) {
    await run("typechain");
  },
  onIstanbulComplete: async function (_config) {
    // We need to do this because solcover generates bespoke artifacts.
    shell.rm("-rf", "./artifacts");
    shell.rm("-rf", "./typechain");
  },
  skipFiles: ["mocks", "test"],
  mocha: {
    timeout: 20000,
    grep: "@skip-on-coverage", // Find everything with this tag
    invert: true, // Run the grep's inverse set.
  },
};
