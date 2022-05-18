import { parseEther } from "ethers/lib/utils";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import getContractAddress from "../deploy-helpers/getContractAddress";

enum ForeignChains {
  ETHEREUM_MAINNET = 1,
  ETHEREUM_RINKEBY = 4,
  HARDHAT = 31337,
}
const paramsByChainId = {
  1: {
    deposit: parseEther("0.1"),
    epochPeriod: 86400, // 1 day
    homeChainId: 42161, // arbitrum
    arbInbox: "0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f", // https://developer.offchainlabs.com/docs/useful_addresses
    genesis: 1652709415 // sample genesis time
  },
  4: {
    deposit: parseEther("0.1"),
    epochPeriod: 120, // 2 min
    homeChainId: 421611, // arbitrum testnet
    arbInbox: "0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e", // https://developer.offchainlabs.com/docs/useful_addresses
    genesis: 1652709415 // sample genesis time
  },
  31337: {
    deposit: parseEther("0.1"),
    epochPeriod: 120, // 2 min
    homeChainId: 31337,
    arbInbox: ethers.constants.AddressZero,
    genesis: 1652709415 // sample genesis time
  },
};

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy } = deployments;
  const { providers } = ethers;
  const { hexZeroPad } = hre.ethers.utils;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to chainId %s with deployer %s", chainId, deployer);

  const homeNetworks = {
    1: config.networks.arbitrum,
    4: config.networks.arbitrumRinkeby,
    31337: config.networks.localhost,
  };

  // Hack to predict the deployment address on the home chain.
  // TODO: use deterministic deployments
  let nonce;
  if (chainId === ForeignChains.HARDHAT) {
    nonce = await ethers.provider.getTransactionCount(deployer);
    nonce += 4; // HomeGatewayToEthereum deploy tx will be the 6th after this, same network for both home/foreign.
  } else {
    const homeChainProvider = new providers.JsonRpcProvider(homeNetworks[chainId].url);
    nonce = await homeChainProvider.getTransactionCount(deployer);
    nonce += 1; // HomeGatewayToEthereum deploy tx will the third tx after this on its home network, so we add two to the current nonce.
  }
  const { deposit, epochPeriod, homeChainId, arbInbox, genesis } = paramsByChainId[chainId];
  const homeChainIdAsBytes32 = hexZeroPad(homeChainId, 32);
  const chainIdAsBytes32 = hexZeroPad("0x" + chainId.toString(16), 32);

  const homeGatewayAddress = getContractAddress(deployer, nonce);
  console.log("calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);
  const homeGatewayCentralizedArbitratorAddress = getContractAddress(deployer, nonce + 1);
  console.log("calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);
  const fastBridgeSenderAddress = getContractAddress(deployer, nonce - 1);
  console.log("calculated future fastBridgeSender address for nonce %d: %s", nonce, fastBridgeSenderAddress);

  const fastBridgeReceiver = await deploy("FastBridgeReceiverOnEthereum", {
    from: deployer,
    args: [
      arbInbox, // should be Arbitrum Inbox
      deposit,
      epochPeriod,
      fastBridgeSenderAddress,
      genesis
    ],
    log: true,
  });

  const foreignGateway = await deploy("ForeignGatewayOnEthereum", {
    from: deployer,
    contract: "ForeignGatewayOnEthereum",
    args: [
      deployer,
      fastBridgeReceiver.address,
      [ethers.BigNumber.from(10).pow(17)],
      homeGatewayAddress,
      homeChainIdAsBytes32,
      chainIdAsBytes32
    ],
    log: true,
  });

  const foreignGatewayCentralizedArbitrator = await deploy("ForeignGatewayOnEthereumCentralizedArbitrator", {
    from: deployer,
    contract: "ForeignGatewayOnEthereum",
    args: [
      deployer,
      fastBridgeReceiver.address,
      [ethers.BigNumber.from(10).pow(17)],
      homeGatewayCentralizedArbitratorAddress,
      homeChainIdAsBytes32,
      chainIdAsBytes32
    ],
    log: true,
  });

  const metaEvidenceUri =
    "https://raw.githubusercontent.com/kleros/kleros-v2/master/contracts/deployments/rinkeby/MetaEvidence_ArbitrableExample.json";
  const arbitrable = await deploy("ArbitrableExample", {
    from: deployer,
    args: [foreignGateway.address, metaEvidenceUri],
    log: true,
  });

  const arbitrableCentralizedArbitrator = await deploy("ArbitrableExampleCentralizedArbitrator", {
    from: deployer,
    contract: "ArbitrableExample",
    args: [foreignGateway.address, metaEvidenceUri],
    log: true,
  });
};

deployForeignGateway.tags = ["ForeignChain", "ForeignGateway"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
