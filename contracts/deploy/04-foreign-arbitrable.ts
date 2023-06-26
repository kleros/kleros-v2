import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import disputeTemplate from "../../kleros-sdk/config/v2-disputetemplate/simple/NewDisputeTemplate.simple.json";

enum ForeignChains {
  ETHEREUM_MAINNET = 1,
  ETHEREUM_GOERLI = 5,
  GNOSIS_MAINNET = 100,
  GNOSIS_CHIADO = 10200,
}

const foreignGatewayArtifactByChain = new Map<ForeignChains, string>([
  [ForeignChains.ETHEREUM_MAINNET, "ForeignGatewayOnEthereum"],
  [ForeignChains.ETHEREUM_GOERLI, "ForeignGatewayOnEthereum"],
  [ForeignChains.GNOSIS_MAINNET, "ForeignGatewayOnGnosis"],
  [ForeignChains.GNOSIS_CHIADO, "ForeignGatewayOnGnosis"],
]);

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy, execute } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to chainId %s with deployer %s", chainId, deployer);

  const foreignGatewayArtifact = foreignGatewayArtifactByChain.get(chainId) ?? ethers.constants.AddressZero;
  const foreignGateway = await deployments.get(foreignGatewayArtifact);
  console.log("Using foreign gateway: %s", foreignGatewayArtifact);

  const extraData =
    "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003"; // General court, 3 jurors
  const weth = await deployments.get("WETH");
  await deploy("ArbitrableExample", {
    from: deployer,
    args: [foreignGateway.address, disputeTemplate, extraData, weth.address],
    log: true,
  });
};

deployForeignGateway.tags = ["ForeignArbitrable"];
deployForeignGateway.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployForeignGateway;
