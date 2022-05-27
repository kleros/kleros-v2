import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const HOME_CHAIN_IDS = [42161, 421611, 31337]; // ArbOne, ArbRinkeby, Hardhat

// TODO: use deterministic deployments

const deployHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const chainId = Number(await getChainId());

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  console.log("deployer: %s", deployer);

  // ----------------------------------------------------------------------------------------------
  const hardhatDeployer = async () => {
    const fastBridgeReceiver = await deployments.get("FastBridgeReceiverOnEthereum");
    const arbSysMock = await deploy("ArbSysMock", { from: deployer, log: true });
    const epochPeriod = 86400; // 1 day
    const genesis = 1652709415 // sample genesis time

    const fastBridgeSender = await deploy("FastBridgeSenderToEthereumMock", {
      from: deployer,
      contract: "FastBridgeSenderMock",
      args: [epochPeriod, genesis, fastBridgeReceiver.address, arbSysMock.address],
      log: true,
    }); // nonce+0

    const klerosCore = await deployments.get("KlerosCore");
    const foreignGateway = await deployments.get("ForeignGatewayOnEthereum");
    let foreignChainId = 1;
    if (chainId === 31337){
      foreignChainId = 31337;
    } else if (chainId === 421611){
      foreignChainId = 4;
    }
    const homeGatewayToEthereum = await deploy("HomeGatewayToEthereum", {
      from: deployer,
      contract: "HomeGateway",
      args: [deployer, klerosCore.address, fastBridgeSender.address, foreignGateway.address, foreignChainId],
      gasLimit: 4000000,
      log: true,
    }); // nonce+1
    foreignChainId = 100;
    if (chainId === 31337){
      foreignChainId = 31337;
    }
    const homeGatewayToGnosis = await deploy("HomeGatewayToGnosis", {
      from: deployer,
      contract: "HomeGateway",
      args: [deployer, klerosCore.address, fastBridgeSender.address, foreignGateway.address, foreignChainId],
      gasLimit: 4000000,
      log: true,
    }); // nonce+1


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

    await deploy("InboxMock", {
      from: deployer,
      args: [bridge.address],
      log: true,
    });
  };

  // ----------------------------------------------------------------------------------------------
  const liveDeployer = async () => {
    const fastBridgeReceiver = await hre.companionNetworks.foreign.deployments.get("FastBridgeReceiverOnEthereum");

    const fastBridgeSender = await deploy("FastBridgeSenderToEthereum", {
      from: deployer,
      args: [deployer, fastBridgeReceiver.address, ethers.constants.AddressZero],
      log: true,
    }); // nonce+0

    const klerosCore = await deployments.get("KlerosCore");
    const foreignGateway = await hre.companionNetworks.foreign.deployments.get("ForeignGatewayOnEthereum");
    const foreignChainId = Number(await hre.companionNetworks.foreign.getChainId());
    const homeGateway = await deploy("HomeGatewayToEthereum", {
      from: deployer,
      contract: "HomeGateway",
      args: [deployer, klerosCore.address, fastBridgeSender.address, foreignGateway.address, foreignChainId],
      log: true,
    }); // nonce+1

    const fastSender = await hre.ethers
      .getContractAt("FastBridgeSenderToEthereum", fastBridgeSender.address)
      .then((contract) => contract.fastBridgeSender());

    if (fastSender === ethers.constants.AddressZero) {
      await execute(
        "FastBridgeSenderToEthereum",
        { from: deployer, log: true },
        "changeFastSender",
        homeGateway.address
      );
    }
  };

  // ----------------------------------------------------------------------------------------------
  if (chainId === 31337) {
    await hardhatDeployer();
  } else {
    await liveDeployer();
  }
};

deployHomeGateway.tags = ["HomeChain", "HomeGateway"];
deployHomeGateway.skip = async ({ getChainId }) => !HOME_CHAIN_IDS.includes(Number(await getChainId()));

export default deployHomeGateway;
