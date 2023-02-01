import { parseEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getContractAddress from "../deploy-helpers/getContractAddress";
import { util } from "chai";
import { rng } from "../typechain-types/src";

enum ForeignChains {
  GNOSIS_MAINNET = 100,
  GNOSIS_CHIADO = 10200,
  HARDHAT = 31337,
}

const wethByChain = new Map<ForeignChains, string>([
  [ForeignChains.GNOSIS_MAINNET, "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1"],
]);

const xPinakionByChain = new Map<ForeignChains, string>([
  [ForeignChains.GNOSIS_MAINNET, "0x37b60f4E9A31A64cCc0024dce7D0fD07eAA0F7B3"],
  [ForeignChains.GNOSIS_CHIADO, "0x00"],
]);

const tokenBridgeByChain = new Map<ForeignChains, string>([
  [ForeignChains.GNOSIS_MAINNET, "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d"],
  [ForeignChains.GNOSIS_CHIADO, "0xbb3c86f9918C3C1d83668fA84e79E876d147fFf2"],
]);

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy, execute } = deployments;
  const { hexZeroPad, hexlify } = ethers.utils;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to chainId %s with deployer %s", chainId, deployer);

  const homeNetworks = {
    1: config.networks.arbitrum,
    5: config.networks.arbitrumGoerli,
  };

  // Hack to predict the deployment address on the home chain.
  // TODO: use deterministic deployments
  const homeChainProvider = new ethers.providers.JsonRpcProvider(homeNetworks[chainId].url);
  let nonce = await homeChainProvider.getTransactionCount(deployer);
  nonce += 2; // HomeGatewayToEthereum deploy tx will the third tx after this on its home network, so we add two to the current nonce.
  const homeChainId = (await homeChainProvider.getNetwork()).chainId;
  const homeChainIdAsBytes32 = hexZeroPad(hexlify(homeChainId), 32);
  const homeGatewayAddress = getContractAddress(deployer, nonce);
  console.log("calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);

  const veaReceiver = await deployments.get("FastBridgeReceiverOnGnosis");

  // const wEth = await deployments.get("WETH");
  const wEth = wethByChain[chainId];

  // const xPnk = await deployments.get("WPNK");
  const xPnk = xPinakionByChain[chainId];

  const tokenBridge = tokenBridgeByChain[chainId];
  const rnGenerator = ethers.constants.AddressZero;

  // TODO: deploy mocks for xPinakion and tokenBridge for Hardhat network

  const wPnk = await deploy("WrappedPinakion", {
    from: deployer,
    log: true,
  });

  await execute(
    "WrappedPinakion",
    { from: deployer, log: true },
    "initialize",
    "Staking PNK on xDai",
    "stPNK",
    xPnk,
    tokenBridge
  );

  const xKlerosLiquidToV2 = await deploy("xKlerosLiquidToV2", {
    from: deployer,
    log: true,
  });

  await execute(
    "xKlerosLiquidToV2",
    { from: deployer, log: true },
    "initialize",
    deployer,
    wPnk,
    rnGenerator,
    99999999,
    0,
    false,
    [999999999, 0, 0, 9999999],
    []
  );

  const metaEvidenceUri = `https://raw.githubusercontent.com/kleros/kleros-v2/master/contracts/deployments/${hre.network.name}/MetaEvidence_ArbitrableExample.json`;

  await deploy("ArbitrableExample", {
    from: deployer,
    args: [foreignGateway.address, metaEvidenceUri],
    log: true,
  });
};

deployForeignGateway.tags = ["ForeignChain", "KlerosLiquidOnGnosis"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
