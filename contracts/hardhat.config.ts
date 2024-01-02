/* eslint-disable node/no-missing-require */
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-solhint";
import "@typechain/hardhat";
import "hardhat-deploy-tenderly";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-watcher";
import "hardhat-docgen";
import "hardhat-contract-sizer";
import "hardhat-tracer";
require("./scripts/simulations/tasks");

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  paths: {
    sources: "./src",
    cache: "./cache_hardhat",
  },
  networks: {
    hardhat: {
      live: false,
      saveDeployments: true,
      allowUnlimitedContractSize: true,
      tags: ["test", "local"],
      companionNetworks: {
        home: "hardhat",
        foreign: "hardhat",
      },
    },
    localhost: {
      url: `http://127.0.0.1:8545`,
      chainId: 31337,
      saveDeployments: true,
      tags: ["test", "local"],
      companionNetworks: {
        home: "localhost",
        foreign: "localhost",
      },
    },
    dockerhost: {
      url: `http://host.docker.internal:8545`,
      chainId: 31337,
      saveDeployments: true,
      tags: ["test", "local"],
      companionNetworks: {
        foreign: "localhost",
      },
    },
    mainnetFork: {
      chainId: 1,
      url: `http://127.0.0.1:8545`,
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
      accounts: process.env.MAINNET_PRIVATE_KEY !== undefined ? [process.env.MAINNET_PRIVATE_KEY] : [],
      live: false,
      saveDeployments: false,
      tags: ["test", "local"],
      companionNetworks: {
        home: "arbitrum",
      },
    },
    arbitrumSepoliaFork: {
      chainId: 421614,
      url: `http://127.0.0.1:8545`,
      forking: {
        url: process.env.ARBITRUM_SEPOLIA_RPC ?? "https://sepolia-rollup.arbitrum.io/rpc",
      },
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: false,
      saveDeployments: true,
      tags: ["test", "local"],
      companionNetworks: {
        foreign: "sepolia",
      },
    },

    // Home chain ---------------------------------------------------------------------------------
    arbitrumSepolia: {
      chainId: 421614,
      url: process.env.ARBITRUM_SEPOLIA_RPC ?? "https://sepolia-rollup.arbitrum.io/rpc",
      accounts:
        (process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_1 && [
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_1 as string,
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_2 as string,
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_3 as string,
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_4 as string,
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_5 as string,
        ]) ||
        (process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []),
      live: true,
      saveDeployments: true,
      tags: ["staging", "home", "layer2"],
      companionNetworks: {
        foreignChiado: "chiado",
        foreignSepolia: "sepolia",
      },
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.arbiscan.io",
          apiKey: process.env.ARBISCAN_API_KEY,
        },
      },
    },
    arbitrumSepoliaDevnet: {
      chainId: 421614,
      url: process.env.ARBITRUM_SEPOLIA_RPC ?? "https://sepolia-rollup.arbitrum.io/rpc",
      accounts:
        (process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_1 && [
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_1 as string,
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_2 as string,
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_3 as string,
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_4 as string,
          process.env.ARB_GOERLI_PRIVATE_KEY_WALLET_5 as string,
        ]) ||
        (process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []),
      live: true,
      saveDeployments: true,
      tags: ["staging", "home", "layer2"],
      companionNetworks: {
        foreignChiado: "chiadoDevnet",
        foreignSepolia: "sepoliaDevnet",
      },
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.arbiscan.io",
          apiKey: process.env.ARBISCAN_API_KEY,
        },
      },
    },
    arbitrum: {
      chainId: 42161,
      url: "https://arb1.arbitrum.io/rpc",
      accounts: process.env.MAINNET_PRIVATE_KEY !== undefined ? [process.env.MAINNET_PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["production", "home", "layer2"],
      companionNetworks: {
        foreign: "mainnet",
      },
      verify: {
        etherscan: {
          apiKey: process.env.ARBISCAN_API_KEY,
        },
      },
    },
    // Foreign chain ---------------------------------------------------------------------------------
    sepolia: {
      chainId: 11155111,
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["staging", "foreign", "layer1"],
      companionNetworks: {
        home: "arbitrumSepolia",
      },
    },
    sepoliaDevnet: {
      chainId: 11155111,
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["staging", "foreign", "layer1"],
      companionNetworks: {
        home: "arbitrumSepoliaDevnet",
      },
    },
    mainnet: {
      chainId: 1,
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.MAINNET_PRIVATE_KEY !== undefined ? [process.env.MAINNET_PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["production", "foreign", "layer1"],
      companionNetworks: {
        home: "arbitrum",
      },
    },
    chiado: {
      chainId: 10200,
      url: "https://rpc.chiado.gnosis.gateway.fm",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["staging", "foreign", "layer1"],
      companionNetworks: {
        home: "arbitrumSepolia",
      },
      verify: {
        etherscan: {
          apiUrl: "https://gnosis-chiado.blockscout.com",
          apiKey: "",
        },
      },
    },
    chiadoDevnet: {
      chainId: 10200,
      url: "https://rpc.chiado.gnosis.gateway.fm",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["staging", "foreign", "layer1"],
      companionNetworks: {
        home: "arbitrumSepoliaDevnet",
      },
      verify: {
        etherscan: {
          apiUrl: "https://gnosis-chiado.blockscout.com",
          apiKey: "",
        },
      },
    },
    gnosischain: {
      chainId: 100,
      url: `https://rpc.gnosis.gateway.fm`,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["production", "foreign", "layer1"],
      verify: {
        etherscan: {
          apiKey: process.env.GNOSISSCAN_API_KEY,
        },
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    relayer: {
      default: 1,
    },
    bridger: {
      default: 2,
    },
    challenger: {
      default: 3,
    },
    firstWallet: {
      default: "0x1cC9304B31F05d27470ccD855b05310543b70f17",
    },
    secondWallet: {
      default: "0x4D74a4FD4057a770da74b0C3e9fa8A02f7f09c94",
    },
    thirdWallet: {
      default: "0xBe7ee23877D530b8a17971CfDA7B5925b57e87B1",
    },
    fourthWallet: {
      default: "0x01ba2b3D0eceAD6358aEcD508221A70f6CA4f6ea",
    },
    fifthWallet: {
      default: "0xE64DC94D545C10b2364F4aBAf9F6F416dAcED13a",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined ? process.env.REPORT_GAS === "true" : false,
    currency: "USD",
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY_FIX,
    },
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
        {
          command: "test",
          params: {
            noCompile: true,
            testFiles: ["./test/arbitration/index.ts"],
          },
        },
      ],
      files: ["./test/**/*", "./src/**/*"],
    },
  },
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: false,
  },
  mocha: {
    timeout: 20000,
  },
  tenderly: {
    project: process.env.TENDERLY_PROJECT !== undefined ? process.env.TENDERLY_PROJECT : "kleros-v2",
    username: process.env.TENDERLY_USERNAME !== undefined ? process.env.TENDERLY_USERNAME : "",
  },
  external: {
    // https://github.com/wighawag/hardhat-deploy#importing-deployment-from-other-projects-with-truffle-support
    deployments: {
      arbitrumSepolia: ["../node_modules/@kleros/vea-contracts/deployments/arbitrumSepolia"],
      arbitrumSepoliaDevnet: ["../node_modules/@kleros/vea-contracts/deployments/arbitrumSepolia"],
      arbitrum: ["../node_modules/@kleros/vea-contracts/deployments/arbitrum"],
      chiado: ["../node_modules/@kleros/vea-contracts/deployments/chiado"],
      chiadoDevnet: ["../node_modules/@kleros/vea-contracts/deployments/chiado"],
      gnosischain: ["../node_modules/@kleros/vea-contracts/deployments/gnosischain"],
      sepolia: ["../node_modules/@kleros/vea-contracts/deployments/sepolia"],
      sepoliaDevnet: ["../node_modules/@kleros/vea-contracts/deployments/sepolia"],
      mainnet: ["../node_modules/@kleros/vea-contracts/deployments/mainnet"],
    },
  },
};

export default config;
