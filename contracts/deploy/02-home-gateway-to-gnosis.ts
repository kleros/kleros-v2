import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
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

  const veaInbox = await deployments.get("VeaInboxArbToGnosisDevnet");
  const klerosCore = await deployments.get("KlerosCore");
  const dai = await deployments.get("DAI");

  const foreignGateway = await hre.companionNetworks.foreignChiado.deployments.get("ForeignGatewayOnGnosis");
  const foreignChainId = Number(await hre.companionNetworks.foreignChiado.getChainId());
  const foreignChainName = await hre.companionNetworks.foreignChiado.deployments.getNetworkName();
  console.log("using ForeignGateway %s on chainId %s (%s)", foreignGateway.address, foreignChainId, foreignChainName);

  await deployUpgradable(deployments, "HomeGatewayToGnosis", {
    from: deployer,
    contract: "HomeGateway",
    args: [deployer, klerosCore.address, veaInbox.address, foreignChainId, foreignGateway.address, dai.address],
    log: true,
  }); // nonce+0
};

deployHomeGateway.tags = ["HomeGatewayToGnosis"];
deployHomeGateway.skip = async ({ network }) => {
  const chainId = network.config.chainId ?? 0;
  return isSkipped(network, !HomeChains[chainId] || HardhatChain[chainId] !== undefined);
};

export default deployHomeGateway;
