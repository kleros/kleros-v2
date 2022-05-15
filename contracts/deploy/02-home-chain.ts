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
  
  const fastBridgeSender = chainId === 31337 ? await deploy("FastBridgeSenderToEthereumMock", {
    from: deployer,
    args: [deployer, fastBridgeReceiver.address, ethers.constants.AddressZero],
    log: true,
  }) : await deploy("FastBridgeSenderToEthereum", {
    from: deployer,
    args: [deployer, fastBridgeReceiver.address, ethers.constants.AddressZero],
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
    args: [klerosCore.address, fastBridgeSender.address, foreignGateway.address, foreignChainId],
    log: true,
  }); // nonce+1

  if (chainId == 31337) {
    const fastSender = await hre.ethers
    .getContractAt("FastBridgeSenderToEthereumMock", fastBridgeSender.address)
    .then((contract) => contract.fastBridgeSender());
  if (fastSender === ethers.constants.AddressZero) {
    await execute("FastBridgeSenderToEthereumMock", { from: deployer, log: true }, "changeFastSender", homeGateway.address);
  } 
  } else {
    const fastSender = await hre.ethers
    .getContractAt("FastBridgeSenderToEthereum", fastBridgeSender.address)
    .then((contract) => contract.fastBridgeSender());
  if (fastSender === ethers.constants.AddressZero) {
    await execute("FastBridgeSenderToEthereum", { from: deployer, log: true }, "changeFastSender", homeGateway.address);
  }
  }

  if (chainId == 31337) {
    const outbox = await deploy("OutboxMock", {
      from: deployer,
      args: [fastBridgeSender.address],
      log: true,
    });

    const bridge = await deploy("BridgeMock", {
      from: deployer,
      args: [outbox.address],
      log: true,
    });

    const inbox = await deploy("InboxMock", {
      from: deployer,
      args: [bridge.address],
      log: true,
    });
  }
};

deployHomeGateway.tags = ["HomeChain", "HomeGateway"];
deployHomeGateway.skip = async ({ getChainId }) => !HOME_CHAIN_IDS.includes(Number(await getChainId()));

export default deployHomeGateway;
