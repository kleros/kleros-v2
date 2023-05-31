import { parseUnits } from "ethers/lib/utils";
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

const ONE_GWEI = parseUnits("1", "gwei");

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy, execute } = deployments;
  const { hexZeroPad, hexlify } = ethers.utils;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to chainId %s with deployer %s", chainId, deployer);

  const homeNetworks = {
    GNOSIS_MAINNET: config.networks.arbitrum,
    GNOSIS_CHIADO: config.networks.arbitrumGoerli,
    HARDHAT: config.networks.localhost,
  };

  // Hack to predict the deployment address on the home chain.
  // TODO: use deterministic deployments
  const homeChainProvider = new ethers.providers.JsonRpcProvider(homeNetworks[ForeignChains[chainId]].url);
  const nonce = await homeChainProvider.getTransactionCount(deployer);
  const homeGatewayAddress = getContractAddress(deployer, nonce); // HomeGateway deploy tx will be the next tx home network
  console.log("Calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);

  const veaReceiver = await deployments.get("VeaInboxArbToGnosisDevnet");
  console.log("Using VeaInboxArbToGnosisDevnet at %s", veaReceiver.address);

  if (!wethByChain.get(chainId)) {
    const weth = await deploy("WETH", {
      from: deployer,
      log: true,
      maxFeePerGas: ONE_GWEI,
      maxPriorityFeePerGas: ONE_GWEI,
    });

    wethByChain.set(ForeignChains[ForeignChains[chainId]], weth.address);

    await deploy("WETHFaucet", {
      from: deployer,
      contract: "Faucet",
      args: [weth.address],
      log: true,
      maxFeePerGas: ONE_GWEI,
      maxPriorityFeePerGas: ONE_GWEI,
    });
  }

  const wethAddress = wethByChain.get(ForeignChains[ForeignChains[chainId]]);
  const homeChainId = (await homeChainProvider.getNetwork()).chainId;
  const homeChainIdAsBytes32 = hexZeroPad(hexlify(homeChainId), 32);

  await deploy("ForeignGatewayOnGnosis", {
    from: deployer,
    contract: "ForeignGatewayOnGnosis",
    args: [deployer, veaReceiver.address, homeGatewayAddress, homeChainIdAsBytes32, wethAddress],
    log: true,
    maxFeePerGas: ONE_GWEI,
    maxPriorityFeePerGas: ONE_GWEI,
  });

  // TODO: disable the gateway until fully initialized with the correct fees OR allow disputeCreators to add funds again if necessary.
  await execute(
    "ForeignGatewayOnGnosis",
    { from: deployer, log: true },
    "changeCourtJurorFee",
    0,
    ethers.utils.parseEther("0.00001")
  );
};

deployForeignGateway.tags = ["ForeignGatewayOnGnosis"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
