import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getContractAddress from "./utils/getContractAddress";
import { KlerosCore__factory } from "../typechain-types";
import { ForeignChains, isSkipped } from "./utils";
import { deployUpgradable } from "./utils/deployUpgradable";

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy, execute } = deployments;
  const { hexZeroPad, hexlify } = ethers.utils;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to chainId %s with deployer %s", chainId, deployer);

  const homeNetworks = {
    ETHEREUM_MAINNET: config.networks.arbitrum,
    ETHEREUM_GOERLI: config.networks.arbitrumGoerli,
    HARDHAT: config.networks.localhost,
  };

  // Hack to predict the deployment address on the home chain.
  // TODO: use deterministic deployments
  const homeChainProvider = new ethers.providers.JsonRpcProvider(homeNetworks[ForeignChains[chainId]].url);
  let nonce = await homeChainProvider.getTransactionCount(deployer);
  nonce += 1; // HomeGatewayToEthereum Proxy deploy tx will be the 2nd tx after this on its home network, so we add 1 to the current nonce.
  const homeGatewayAddress = getContractAddress(deployer, nonce);
  console.log("Calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);

  const veaOutbox = await deployments.get("VeaOutboxArbToEthDevnet");
  console.log("Using VeaOutboxArbToEthDevnet at %s", veaOutbox.address);

  const homeChainId = (await homeChainProvider.getNetwork()).chainId;
  const homeChainIdAsBytes32 = hexZeroPad(hexlify(homeChainId), 32);
  await deployUpgradable(hre, "ForeignGatewayOnEthereum", {
    from: deployer,
    contract: "ForeignGateway",
    args: [deployer, veaOutbox.address, homeChainIdAsBytes32, homeGatewayAddress],
    gasLimit: 4000000,
    log: true,
  });

  // TODO: disable the gateway until fully initialized with the correct fees OR allow disputeCreators to add funds again if necessary.
  const coreDeployment = await hre.companionNetworks.home.deployments.get("KlerosCore");
  const core = await KlerosCore__factory.connect(coreDeployment.address, homeChainProvider);
  // TODO: set up the correct fees for the FORKING_COURT
  const courtId = await core.GENERAL_COURT();
  const fee = (await core.courts(courtId)).feeForJuror;
  await execute("ForeignGatewayOnEthereum", { from: deployer, log: true }, "changeCourtJurorFee", courtId, fee);
  // TODO: set up the correct fees for the lower courts
};

deployForeignGateway.tags = ["ForeignGatewayOnEthereum"];
deployForeignGateway.skip = async ({ network }) => {
  return isSkipped(network, !ForeignChains[network.config.chainId ?? 0]);
};

export default deployForeignGateway;
