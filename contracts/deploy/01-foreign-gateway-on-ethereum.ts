import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getContractAddress from "../deploy-helpers/getContractAddress";
import disputeTemplate from "../../kleros-sdk/config/v2-disputetemplate/simple/NewDisputeTemplate.simple.json";

enum ForeignChains {
  ETHEREUM_MAINNET = 1,
  ETHEREUM_GOERLI = 5,
}

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
  nonce += 2; // HomeGatewayToEthereum deploy tx will the third tx after this on its home network, so we add two to the current nonce.
  const homeChainId = (await homeChainProvider.getNetwork()).chainId;
  const homeChainIdAsBytes32 = hexZeroPad(hexlify(homeChainId), 32);
  const homeGatewayAddress = getContractAddress(deployer, nonce);
  console.log("Calculated future HomeGatewayToEthereum address for nonce %d: %s", nonce, homeGatewayAddress);

  const veaOutbox = await deployments.get("VeaOutboxArbToEthDevnet");
  console.log("Using VeaOutboxArbToEthDevnet at %s", veaOutbox.address);

  const foreignGateway = await deploy("ForeignGatewayOnEthereum", {
    from: deployer,
    contract: "ForeignGateway",
    args: [deployer, veaOutbox.address, homeGatewayAddress, homeChainIdAsBytes32],
    gasLimit: 4000000,
    log: true,
  });

  await execute(
    "ForeignGatewayOnEthereum",
    { from: deployer, log: true },
    "changeCourtJurorFee",
    0,
    ethers.BigNumber.from(10).pow(17)
  );

  await deploy("ArbitrableExample", {
    from: deployer,
    contract: "ArbitrableExampleEthFee",
    args: [foreignGateway.address, disputeTemplate],
    log: true,
  });
};

deployForeignGateway.tags = ["ForeignGatewayOnEthereum"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
