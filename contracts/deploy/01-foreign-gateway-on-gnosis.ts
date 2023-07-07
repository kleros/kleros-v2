import { parseUnits } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getContractAddress from "../deploy-helpers/getContractAddress";
import { KlerosCore__factory } from "../typechain-types";

enum ForeignChains {
  GNOSIS_MAINNET = 100,
  GNOSIS_CHIADO = 10200,
  HARDHAT = 31337,
}

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

  // FIXME: this computed address is wrong for deploys to testnets, okay on Hardhat
  const homeGatewayAddress = getContractAddress(deployer, nonce); // HomeGateway deploy tx will be the next tx home network
  console.log("Calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);

  const veaOutbox = await deployments.get("VeaOutboxArbToGnosisDevnet");
  console.log("Using VeaOutboxArbToGnosisDevnet at %s", veaOutbox.address);

  const homeChainId = (await homeChainProvider.getNetwork()).chainId;
  const homeChainIdAsBytes32 = hexZeroPad(hexlify(homeChainId), 32);
  await deploy("ForeignGatewayOnGnosis", {
    from: deployer,
    contract: "ForeignGateway",
    args: [deployer, veaOutbox.address, homeChainIdAsBytes32, homeGatewayAddress],
    log: true,
    maxFeePerGas: ONE_GWEI,
    maxPriorityFeePerGas: ONE_GWEI,
  });

  // TODO: disable the gateway until fully initialized with the correct fees OR allow disputeCreators to add funds again if necessary.
  const coreDeployment = await hre.companionNetworks.home.deployments.get("KlerosCore");
  const core = await KlerosCore__factory.connect(coreDeployment.address, homeChainProvider);
  // TODO: set up the correct fees for the FORKING_COURT
  const courtId = await core.GENERAL_COURT();
  const fee = (await core.courts(courtId)).feeForJuror;
  await execute("ForeignGatewayOnGnosis", { from: deployer, log: true }, "changeCourtJurorFee", courtId, fee);
  // TODO: set up the correct fees for the lower courts
};

deployForeignGateway.tags = ["ForeignGatewayOnGnosis"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
