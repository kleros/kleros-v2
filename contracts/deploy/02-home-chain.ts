import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const HOME_CHAIN_IDS = [42161, 421611, 31337]; // ArbOne, ArbRinkeby, Hardhat

const deployHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  console.log("deployer: %s", deployer);

  const safeBridge = await deploy("SafeBridgeArbitrum", {
    from: deployer,
    log: true,
  }); // nonce

  const fastBridgeReceiver = await hre.companionNetworks.foreign.deployments.get("FastBridgeReceiver");
  const fastBridgeSender = await deploy("FastBridgeSender", {
    from: deployer,
    args: [safeBridge.address, fastBridgeReceiver.address],
    log: true,
  }); // nonce+1

  const klerosCore = await deployments.get("KlerosCore");
  const foreignGateway = await hre.companionNetworks.foreign.deployments.get("ForeignGateway");
  const foreignChainId = Number(await hre.companionNetworks.foreign.getChainId());
  const homeGateway = await deploy("HomeGateway", {
    from: deployer,
    args: [klerosCore.address, fastBridgeSender.address, foreignGateway.address, foreignChainId],
    log: true,
  }); // nonce+2

  await execute("FastBridgeSender", { from: deployer, log: true }, "setFastSender", homeGateway.address);
};

deployHomeGateway.tags = ["HomeChain", "HomeGateway"];
deployHomeGateway.skip = async ({ getChainId }) => !HOME_CHAIN_IDS.includes(Number(await getChainId()));

export default deployHomeGateway;
