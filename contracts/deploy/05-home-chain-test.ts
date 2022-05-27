import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Address } from "ethereumjs-util";
import { ethers } from "hardhat";

const HOME_CHAIN_ID = 421611; // ArbRinkeby

const deployHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const chainId = Number(await getChainId());

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  console.log("deployer: %s", deployer);
  // TODO: use deterministic deployments
  const fastBridgeReceiverOnEthereum = await hre.companionNetworks.foreign.deployments.get("FastBridgeReceiverOnEthereum");
  const fastBridgeReceiverOnGnosis = await hre.companionNetworks.foreign.deployments.get("FastBridgeReceiverOnGnosis");

  const genesis = 1652709415; // sample genesis time
  const epochPeriod = 120;

  const fastBridgeSenderToEthereum = await deploy("FastBridgeSenderToEthereum", {
    from: deployer,
    contract: "FastBridgeSender",
    args: [epochPeriod, genesis, fastBridgeReceiverOnEthereum.address],
    log: true,
  });

  const fastBridgeSenderToGnosis = await deploy("FastBridgeSenderToGnosis", {
    from: deployer,
    contract: "FastBridgeSender",
    args: [epochPeriod, genesis, fastBridgeReceiverOnGnosis.address],
    log: true,
  });

  const foreignGatewayOnEthereum = await hre.companionNetworks.foreign.deployments.get("ForeignGatewayMockOnEthereum");
  const foreignGatewayOnGnosis = await hre.companionNetworks.foreign.deployments.get("ForeignGatewayMockOnGnosis");
  const foreignChainId = 4;
  const homeGatewayToEthereum = await deploy("homeGatewayMockToEthereum", {
    from: deployer,
    contract: "HomeGatewayMock",
    args: [
      fastBridgeSenderToEthereum.address, 
      foreignGatewayOnEthereum.address, 
      foreignChainId
    ],
    log: true,
  }); // nonce+1
  const homeGatewayToGnosis = await deploy("homeGatewayMockToGnosis", {
    from: deployer,
    contract: "HomeGatewayMock",
    args: [
      fastBridgeSenderToGnosis.address, 
      foreignGatewayOnGnosis.address, 
      foreignChainId
    ],
    log: true,
  }); // nonce+1
};

deployHomeGateway.tags = ["BridgeTest"];
deployHomeGateway.skip = async ({ getChainId }) => (HOME_CHAIN_ID != Number(await getChainId()));

export default deployHomeGateway;
