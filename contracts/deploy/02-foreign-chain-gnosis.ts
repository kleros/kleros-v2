import { parseEther } from "ethers/lib/utils";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import getContractAddress from "../deploy-helpers/getContractAddress";

enum ForeignChains {
  GNOSIS = 100,
}
const paramsByChainId = {
  100: {
    deposit: parseEther("0.1"),
    epochPeriod: 86400, // 1 day
    homeChainId: 42161,
    amb: "0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59"
  }
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
  };

  // Hack to predict the deployment address on the home chain.
  // TODO: use deterministic deployments
  let nonce;
    const homeChainProvider = new providers.JsonRpcProvider(homeNetworks[chainId].url);
    nonce = await homeChainProvider.getTransactionCount(deployer);
    nonce += 1; // HomeGatewayToEthereum deploy tx will the third tx after this on its home network, so we add two to the current nonce.

  const { deposit, epochPeriod, homeChainId, arbitrumInbox } = paramsByChainId[chainId];
  const homeChainIdAsBytes32 = hexZeroPad(homeChainId, 32);

  const homeGatewayAddress = getContractAddress(deployer, nonce);
  console.log("calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);
  nonce -= 1;

  const fastBridgeSenderAddress = getContractAddress(deployer, nonce);
  console.log("calculated future FastSender for nonce %d: %s", nonce, fastBridgeSenderAddress);

  nonce += 5;

  console.log("calculated future inboxAddress for nonce %d: %s", nonce, arbitrumInbox);
  const genesis = 1652709415 // sample genesis time

  const fastBridgeReceiver = await deploy("FastBridgeReceiverOnEthereum", {
    from: deployer,
    args: [
      deposit,
      epochPeriod,
      genesis,
      arbitrumInbox,
      fastBridgeSenderAddress,
    ],
    log: true,
  });

  const foreignGateway = await deploy("ForeignGatewayOnEthereum", {
    from: deployer,
    contract: "ForeignGateway",
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
