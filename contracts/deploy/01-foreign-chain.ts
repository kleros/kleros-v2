import { parseEther } from "ethers/lib/utils";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import getContractAddress from "../deploy-helpers/getContractAddress";

enum ForeignChains {
  ETHEREUM_MAINNET = 1,
  ETHEREUM_RINKEBY = 4,
  HARDHAT = 31337,
}
const paramsByChainId = {
  1: {
    claimDeposit: parseEther("0.1"),
    challengeDuration: 86400, // 1 day
    homeChainId: 42161,
  },
  4: {
    claimDeposit: parseEther("0.1"),
    challengeDuration: 120, // 2 min
    homeChainId: 421611,
  },
  31337: {
    claimDeposit: parseEther("0.1"),
    challengeDuration: 120, // 2 min
    homeChainId: 31337,
  },
};

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy } = deployments;
  const { providers } = ethers;
  const { hexZeroPad } = hre.ethers.utils;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to chainId %s with deployer %s", chainId, deployer);

  const homeNetworks = {
    1: config.networks.arbitrum,
    4: config.networks.arbitrumRinkeby,
    31337: config.networks.localhost,
  };

  // Hack to predict the deployment address on the home chain.
  // TODO: use deterministic deployments
  let nonce;
  if (chainId === ForeignChains.HARDHAT) {
    nonce = await ethers.provider.getTransactionCount(deployer);
    nonce += 5; // HomeGateway deploy tx will be the 6th after this, same network for both home/foreign.
  } else {
    const homeChainProvider = new providers.JsonRpcProvider(homeNetworks[chainId].url);
    nonce = await homeChainProvider.getTransactionCount(deployer);
    nonce += 2; // HomeGateway deploy tx will the third tx after this on its home network, so we add two to the current nonce.
  }
  const { claimDeposit, challengeDuration, homeChainId } = paramsByChainId[chainId];
  const challengeDeposit = claimDeposit;
  const homeChainIdAsBytes32 = hexZeroPad(homeChainId, 32);

  const homeGatewayAddress = getContractAddress(deployer, nonce);
  console.log("calculated future HomeGateway address for nonce %d: %s", nonce, homeGatewayAddress);

  const fastBridgeReceiver = await deploy("FastBridgeReceiver", {
    from: deployer,
    args: [deployer, claimDeposit, challengeDeposit, challengeDuration],
    log: true,
  });

  const foreignGateway = await deploy("ForeignGateway", {
    from: deployer,
    args: [
      deployer,
      fastBridgeReceiver.address,
      [ethers.BigNumber.from(10).pow(17)],
      homeGatewayAddress,
      homeChainIdAsBytes32,
    ],
    log: true,
  });

  const metaEvidenceUri =
    "https://raw.githubusercontent.com/kleros/kleros-v2/master/contracts/deployments/rinkeby/MetaEvidence_ArbitrableExample.json";
  const arbitrable = await deploy("ArbitrableExample", {
    from: deployer,
    args: [foreignGateway.address, metaEvidenceUri],
    log: true,
  });
};

deployForeignGateway.tags = ["ForeignChain", "ForeignGateway"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
