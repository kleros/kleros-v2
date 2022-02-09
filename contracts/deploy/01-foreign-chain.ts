import { parseEther } from "ethers/lib/utils";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import getContractAddress from "../deploy-helpers/getContractAddress";

const FOREIGN_CHAIN_IDS = [1, 4, 31337];  // Mainnet, Rinkeby, Hardhat
const paramsByChainId = {
  1: {
    claimDeposit: parseEther("0.1"),
    challengeDuration: 86400, // 1 day
    homeChainId: 42161,
  },
  4: {
    claimDeposit: parseEther("0.1"),
    challengeDuration: 3600, // 1 hour
    homeChainId: 421611,
  },
};

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy } = deployments;
  const { providers, constants } = ethers;
  const { hexZeroPad } = hre.ethers.utils;

  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const homeNetworks = {
    1: config.networks.arbitrum,
    4: config.networks.arbitrumRinkeby,
  };
  const { url } = homeNetworks[chainId];
  const homeChainProvider = new providers.JsonRpcProvider(url);
  const nonce = await homeChainProvider.getTransactionCount(deployer);

  const { claimDeposit, challengeDuration, homeChainId } = paramsByChainId[chainId];

  // home Gateway deploy tx will the third tx after this on it's network,
  // so we add two to the current nonce.
  const homeGatewayAddress = getContractAddress(deployer, nonce + 2);

  const homeChainIdAsBytes32 = hexZeroPad(homeChainId, 32);
  console.log(nonce + 2);
  console.log(homeGatewayAddress);

  const fastBridgeReceiver = await deploy("FastBridgeReceiver", {
    from: deployer,
    args: [deployer, claimDeposit, challengeDuration],
    log: true,
  });

  const foreignGateway = await deploy("ForeignGateway", {
    from: deployer,
    args: [deployer, fastBridgeReceiver.address, ["1000", "10000"], homeGatewayAddress, homeChainIdAsBytes32],
    log: true,
  });
};

deployForeignGateway.tags = ["ForeignChain"];
deployForeignGateway.skip = async ({ getChainId }) => !FOREIGN_CHAIN_IDS.includes(Number(await getChainId()));

export default deployForeignGateway;
