import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Address } from "ethereumjs-util";
import { ethers } from "hardhat";

const HOME_CHAIN_IDS = [42161, 421611, 31337]; // ArbOne, ArbRinkeby, Hardhat

const deployHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const chainId = Number(await getChainId());

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  console.log("deployer: %s", deployer);

  // The object below is not available when launching the hardhat node.
  // TODO: use deterministic deployments
  const fastBridgeReceiver =
    chainId === 31337
      ? await deployments.get("FastBridgeReceiverOnEthereum")
      : await hre.companionNetworks.foreign.deployments.get("FastBridgeReceiverOnEthereum");
  //const genesisSynchronization = fastBridgeReceiver.
  const fastBridgeSender = await deploy("FastBridgeSenderToEthereum", {
    from: deployer,
    args: [fastBridgeReceiver.address, 120, 1652709415],
    log: true,
  }); // nonce+0

  const klerosCore = await deployments.get("KlerosCore");
  const foreignGateway =
    chainId === 31337
      ? await deployments.get("ForeignGatewayOnEthereum")
      : await hre.companionNetworks.foreign.deployments.get("ForeignGatewayOnEthereum");
  const foreignChainId = chainId === 31337 ? 31337 : Number(await hre.companionNetworks.foreign.getChainId());
  const homeGateway = await deploy("HomeGatewayToEthereum", {
    from: deployer,
    args: [
      deployer,
      klerosCore.address, 
      fastBridgeSender.address, 
      foreignGateway.address, 
      foreignChainId,
      chainId
    ],
    log: true,
  }); // nonce+1

  const safeBridgeSender = await hre.ethers
    .getContractAt("FastBridgeReceiverOnEthereum", fastBridgeReceiver.address)
    .then((contract) => contract.safeBridgeSender());
  if (safeBridgeSender === ethers.constants.AddressZero) {
    await execute("FastBridgeReceiverOnEthereum", { from: deployer, log: true }, "setSafeBridgeSender", fastBridgeSender.address);
  }

};

deployHomeGateway.tags = ["HomeChain", "HomeGateway"];
deployHomeGateway.skip = async ({ getChainId }) => !HOME_CHAIN_IDS.includes(Number(await getChainId()));

export default deployHomeGateway;
