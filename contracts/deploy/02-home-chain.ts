import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import getContractAddress from "../deploy-helpers/getContractAddress";

const HOME_CHAIN_IDS = [42161, 421611];
const paramsByChainId = {
  4: {
    arbitrator: "0xab96e690f784b305942752a1fda42680e80f37a0", // SimplePermissionlessArbitrator
    foreignChainId: 77,
  },
  42161: {
    arbitrator: "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF", // SimplePermissionlessArbitrator
    foreignChainId: 1,
  },
  421611: {
    arbitrator: "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF", // SimplePermissionlessArbitrator
    foreignChainId: 4,
  },
};

const deployHomeGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const { hexZeroPad } = hre.ethers.utils;

  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const { arbitrator, foreignChainId } = paramsByChainId[chainId];

  const foreignGateway = await hre.companionNetworks.foreign.deployments.get("ForeignGateway");
  const fastBridgeReceiver = await hre.companionNetworks.foreign.deployments.get("FastBridgeReceiver");

  const foreignChainIdAsBytes32 = hexZeroPad(foreignChainId, 32);

  const safeBridge = await deploy("SafeBridgeArbitrum", {
    from: deployer,
    log: true,
  });

  const fastBridgeSender = await deploy("FastBridgeSender", {
    from: deployer,
    args: [safeBridge.address, fastBridgeReceiver.address],
    log: true,
  });

  const homeGateway = await deploy("HomeGateway", {
    from: deployer,
    args: [arbitrator, fastBridgeSender.address, foreignGateway.address, foreignChainIdAsBytes32],
    log: true,
  });

  await execute("FastBridgeSender", { from: deployer, log: true }, "setFastSender", homeGateway.address);
};

deployHomeGateway.tags = ["HomeChain"];
deployHomeGateway.skip = async ({ getChainId }) => !HOME_CHAIN_IDS.includes(Number(await getChainId()));

export default deployHomeGateway;
