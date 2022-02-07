import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

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

const deployHomeGateway: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {ethers, deployments, getNamedAccounts, getChainId, config} = hre;
  const {deploy} = deployments;
  const { providers, constants } = ethers;
  const { hexZeroPad } = hre.ethers.utils;

  const {deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const foreignNetworks = {
    42161: config.networks.mainnet,
    421611: config.networks.rinkeby,
  };
  const { url } = foreignNetworks[chainId];
  const foreignChainProvider = new providers.JsonRpcProvider(url);
  const nonce = await foreignChainProvider.getTransactionCount(deployer);

  const { arbitrator, foreignChainId } = paramsByChainId[chainId];

  // Foreign gateway deploy tx is the last transaction on its network
  // So we get it's current nonce subtracted by 1.
  const foreignGatewayAddress = getContractAddress(deployer, nonce - 1 );
  // And FastBridgeReceiver is the second last tx.
  const fastBridgeReceiverAddress = getContractAddress(deployer, nonce - 2 );

  const foreignChainIdAsBytes32 = hexZeroPad(foreignChainId, 32);
  console.log(fastBridgeReceiverAddress);
  console.log(foreignGatewayAddress);

  let safeBridge = await deploy('SafeArbitrumBridge', {
    from: deployer,
    log: true,
  });

  let fastBridgeSender = await deploy('FastBridgeSender', {
    from: deployer,
    args: [safeBridge.address, fastBridgeReceiverAddress],
    log: true,
  });

  let homeGateway = await deploy('HomeGateway', {
    from: deployer,
    args: [arbitrator, fastBridgeSender.address, foreignGatewayAddress, foreignChainIdAsBytes32],
    log: true,
  });

};

deployHomeGateway.tags = ["HomeChain"];
deployHomeGateway.skip = async ({ getChainId }) => !HOME_CHAIN_IDS.includes(Number(await getChainId()));

export default deployHomeGateway;
