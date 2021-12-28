import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-watcher";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./src",
  },
  networks: {
    hardhat: {
      live: false,
      saveDeployments: false,
      tags: ["test", "local"],
    },
    mainnetFork: {
      url: `http://127.0.0.1:8545`,
      chainId: 1,
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
      accounts: process.env.MAINNET_PRIVATE_KEY !== undefined ? [process.env.MAINNET_PRIVATE_KEY] : [],
      live: false,
      saveDeployments: false,
      tags: ["test", "local"],
    },

    // Home chain ---------------------------------------------------------------------------------
    arbitrumRinkeby: {
      chainId: 421611,
      url: "https://rinkeby.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["staging", "home", "layer2"],
    },
    arbitrum: {
      chainId: 42161,
      url: "https://arb1.arbitrum.io/rpc",
      accounts: process.env.MAINNET_PRIVATE_KEY !== undefined ? [process.env.MAINNET_PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["production", "home", "layer2"],
    },
    // Foreign chain ---------------------------------------------------------------------------------
    rinkeby: {
      chainId: 4,
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["staging", "foreign", "layer1"],
    },
    kovan: {
      chainId: 42,
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["staging", "foreign", "layer1"],
    },
    mainnet: {
      chainId: 1,
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.MAINNET_PRIVATE_KEY !== undefined ? [process.env.MAINNET_PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["production", "foreign", "layer1"],
    },
  },
  namedAccounts: {
    homeDeployer: {
      default: 0,
    },
    foreignDeployer: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  watcher: {
    compilation: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
    testArbitration: {
      tasks: [
        { command: "compile", params: { quiet: true } },
        { command: "test", params: { noCompile: true, testFiles: ["./test/arbitration/index.ts"] } },
      ],
      files: ["./test/**/*", "./src/**/*"],
    },
  },
};

export default config;
