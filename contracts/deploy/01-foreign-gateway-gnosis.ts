import { parseEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getContractAddress from "../deploy-helpers/getContractAddress";

enum ForeignChains {
  GNOSIS_MAINNET = 100,
  GNOSIS_CHIADO = 10200,
  HARDHAT = 31337,
}

const wethByChain = new Map<ForeignChains, string>([
  [ForeignChains.GNOSIS_MAINNET, "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1"],
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

  if (!wethByChain.get(chainId)) {
    const weth = await deploy("WETH", {
      from: deployer,
      log: true,
    });

    wethByChain.set(ForeignChains[ForeignChains[chainId]], weth.address);

    await deploy("WETHFaucet", {
      from: deployer,
      contract: "Faucet",
      args: [weth],
      log: true,
    });
  }

  const foreignGateway = await deploy("xForeignGateway", {
    from: deployer,
    contract: "xForeignGateway",
    args: [deployer, veaReceiver.address, homeGatewayAddress, homeChainIdAsBytes32, wethByChain[chainId]],
    gasLimit: 4000000,
    log: true,
  });

  await execute(
    "xForeignGateway",
    { from: deployer, log: true },
    "changeCourtJurorFee",
    0,
    ethers.utils.parseEther("0.00001") // TODO: fix this from xKlerosLiquid xDAI -> ETH amount
  );
};

deployForeignGateway.tags = ["ForeignChain", "ForeignGatewayOnGnosis"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
