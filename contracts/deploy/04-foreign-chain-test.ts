import { parseEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import getContractAddress from "../deploy-helpers/getContractAddress";

enum ForeignChains {
  ETHEREUM_RINKEBY = 4,
  HARDHAT = 31337,
}
const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy } = deployments;
  const { hexZeroPad } = hre.ethers.utils;

  const deployer = (await getNamedAccounts()).deployer;
  const chainId = Number(await getChainId());
  console.log("deploying to chainId %s with deployer %s", chainId, deployer);

  const deposit = parseEther("0.1")
  const epochPeriod = 120 // 2 min
  const homeChainId = 421611 // arbitrum testnet
  const arbInbox = "0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e" // https://developer.offchainlabs.com/docs/useful_addresses
  const genesis = 1652709415 // sample genesis time

  // TODO: use deterministic deployments
  let nonce = await ethers.provider.getTransactionCount(deployer)+7;

  const fastBridgeSenderToEthereumAddress = getContractAddress(deployer, nonce );
  console.log("calculated future fastBridgeSenderToEthereum address for nonce %d: %s", nonce, fastBridgeSenderToEthereumAddress);
  const fastBridgeSenderToGnosisAddress = getContractAddress(deployer, nonce + 1);
  console.log("calculated future fastBridgeSenderToGnosis address for nonce %d: %s", nonce + 1, fastBridgeSenderToGnosisAddress);
  const homeGatewayOnEthereumAddress = getContractAddress(deployer, nonce + 2);
  console.log("calculated future HomeGatewayOnEthereum address for nonce %d: %s", nonce + 2, homeGatewayOnEthereumAddress);
  const homeGatewayOnGnosisAddress = getContractAddress(deployer, nonce + 3);
  console.log("calculated future HomeGatewayOnGnosis address for nonce %d: %s", nonce + 3, homeGatewayOnGnosisAddress);
  const fastBridgeReceiverOnEthereum = await deploy("FastBridgeReceiverOnEthereum", {
    from: deployer,
    args: [
      deposit,
      epochPeriod,
      genesis,
      arbInbox, // should be Arbitrum Inbox
      fastBridgeSenderToEthereumAddress,
    ],
    log: true,
  });

  const ForeignGatewayOnEthereum = await deploy("ForeignGatewayMockOnEthereum", {
    from: deployer,
    contract: "ForeignGatewayMock",
    args: [
      fastBridgeReceiverOnEthereum.address,
      homeGatewayOnEthereumAddress,
      homeChainId
    ],
    log: true,
  });

  const mockAMB = await deploy("MockAMB", {
    from: deployer,
    log: true,
  }); // nonce+0

  nonce = await ethers.provider.getTransactionCount(deployer) + 1;
  const fastBridgeReceiverOnGnosisChainAddress = getContractAddress(deployer, nonce);
  console.log("calculated future HomeGatewayOnEthereum address for nonce %d: %s", nonce, homeGatewayOnEthereumAddress);

  const safeBridgeRouter = await deploy("SafeBridgeRouter", {
    from: deployer,
    args: [
      arbInbox, 
      mockAMB.address, 
      fastBridgeSenderToGnosisAddress, 
      fastBridgeReceiverOnGnosisChainAddress 
    ],
    log: true,
  }); // nonce+0

  const fastBridgeReceiverOnGnosisChain = await deploy("FastBridgeReceiverOnGnosis", {
    from: deployer,
    args: [
      deposit,
      epochPeriod,
      genesis,
      mockAMB.address, // should be Arbitrum Inbox
      safeBridgeRouter.address,
    ],
    log: true,
  });

  const ForeignGatewayOnGnosis = await deploy("ForeignGatewayMockOnGnosis", {
    from: deployer,
    contract: "ForeignGatewayMock",
    args: [
      fastBridgeReceiverOnGnosisChain.address,
      homeGatewayOnGnosisAddress,
      homeChainId
    ],
    log: true,
  });
};
deployForeignGateway.tags = ["BridgeTest"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};
export default deployForeignGateway;
