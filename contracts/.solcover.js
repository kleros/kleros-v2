/* eslint-disable node/no-extraneous-require */

const shell = require("shelljs");

// The environment variables are loaded in hardhat.config.ts

module.exports = {
  istanbulReporter: ["lcov"],
  configureYulOptimizer: true,
  onCompileComplete: async function (_config) {
    await run("typechain");
  },
  onIstanbulComplete: async function (_config) {
    // We need to do this because solcover generates bespoke artifacts.
    shell.rm("-rf", "./artifacts");
    shell.rm("-rf", "./typechain");
  },
  skipFiles: ["test", "token", "kleros-v1", "proxy/mock", "gateway/mock", "rng/mock"],
  mocha: {
    timeout: 20000,
    grep: "@skip-on-coverage", // Find everything with this tag
    invert: true, // Run the grep's inverse set.
  },
};
