import { parseEther } from "ethers/lib/utils";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import getContractAddress from "../deploy-helpers/getContractAddress";

enum ForeignChains {
  ETHEREUM_MAINNET = 1,
  ETHEREUM_RINKEBY = 4,
  HARDHAT = 31337,
}
const paramsByChainId = {
  1: {
    claimDeposit: parseEther("0.1"),
    challengeDuration: 86400, // 1 day
    homeChainId: 42161,
    arbitrumInbox: "0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f",
  },
  4: {
    claimDeposit: parseEther("0.1"),
    challengeDuration: 120, // 2 min
    homeChainId: 421611,
    arbitrumInbox: "0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e",
  },
  31337: {
    claimDeposit: parseEther("0.1"),
    challengeDuration: 120, // 2 min
    homeChainId: 31337,
    arbitrumInbox: "0x00",
  },
};

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
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
    nonce += 5; // HomeGatewayToEthereum deploy tx will be the 6th after this, same network for both home/foreign.
  } else {
    const homeChainProvider = new providers.JsonRpcProvider(homeNetworks[chainId].url);
    nonce = await homeChainProvider.getTransactionCount(deployer);
    nonce += 1; // HomeGatewayToEthereum deploy tx will the third tx after this on its home network, so we add two to the current nonce.
  }
  const { claimDeposit, challengeDuration, homeChainId, arbitrumInbox } = paramsByChainId[chainId];
  const challengeDeposit = claimDeposit;
  const bridgeAlpha = 5000;
  const homeChainIdAsBytes32 = hexZeroPad(homeChainId, 32);

  const homeGatewayAddress = getContractAddress(deployer, nonce);
  console.log("calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);
  nonce -= 1;

  const fastBridgeSenderAddress = getContractAddress(deployer, nonce);
  console.log("calculated future FastSender for nonce %d: %s", nonce, fastBridgeSenderAddress);

  nonce += 5;

  const inboxAddress = chainId === ForeignChains.HARDHAT ? getContractAddress(deployer, nonce) : arbitrumInbox;
  console.log("calculated future inboxAddress for nonce %d: %s", nonce, inboxAddress);

  const fastBridgeReceiver = await deploy("FastBridgeReceiverOnEthereum", {
    from: deployer,
    args: [
      deployer,
      fastBridgeSenderAddress,
      inboxAddress,
      claimDeposit,
      challengeDeposit,
      challengeDuration,
      bridgeAlpha,
    ],
    log: true,
  });

  const foreignGateway = await deploy("ForeignGatewayOnEthereum", {
    from: deployer,
    args: [
      deployer,
      fastBridgeReceiver.address,
      [ethers.BigNumber.from(10).pow(17)],
      homeGatewayAddress,
      homeChainIdAsBytes32,
    ],
    gasLimit: 4000000,
    log: true,
  });

  const metaEvidenceUri =
    "https://raw.githubusercontent.com/kleros/kleros-v2/master/contracts/deployments/rinkeby/MetaEvidence_ArbitrableExample.json";

  await deploy("ArbitrableExample", {
    from: deployer,
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
