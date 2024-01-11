import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { HardhatChain, HomeChains, isSkipped } from "./utils";
import { deployUpgradable } from "./utils/deployUpgradable";

// TODO: use deterministic deployments

const deployHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to chainId %s with deployer %s", chainId, deployer);

  const veaInbox = await deployments.get("VeaInboxArbToEthDevnet");
  const klerosCore = await deployments.get("KlerosCore");

  const foreignGateway = await hre.companionNetworks.foreignSepolia.deployments.get("ForeignGatewayOnEthereum");
  const foreignChainId = Number(await hre.companionNetworks.foreignSepolia.getChainId());
  const foreignChainName = await hre.companionNetworks.foreignSepolia.deployments.getNetworkName();
  console.log("using ForeignGateway %s on chainId %s (%s)", foreignGateway.address, foreignChainId, foreignChainName);

  await deployUpgradable(deployments, "HomeGatewayToEthereum", {
    from: deployer,
    contract: "HomeGateway",
    args: [
      deployer,
      klerosCore.address,
      veaInbox.address,
      foreignChainId,
      foreignGateway.address,
      ethers.constants.AddressZero, // feeToken is ETH
    ],
    log: true,
  }); // nonce+0
};

deployHomeGateway.tags = ["HomeGatewayToEthereum"];
deployHomeGateway.skip = async ({ network }) => {
  const chainId = network.config.chainId ?? 0;
  return isSkipped(network, !HomeChains[chainId] || HardhatChain[chainId] !== undefined);
};

export default deployHomeGateway;
