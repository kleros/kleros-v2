import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseUnits } from "ethers/lib/utils";
import disputeTemplate from "../test/fixtures/DisputeTemplate.simple.json";
import { ForeignChains, isSkipped } from "./utils";

const foreignGatewayArtifactByChain = new Map<ForeignChains, string>([
  [ForeignChains.ETHEREUM_MAINNET, "ForeignGatewayOnEthereum"],
  [ForeignChains.ETHEREUM_SEPOLIA, "ForeignGatewayOnEthereum"],
  [ForeignChains.GNOSIS_MAINNET, "ForeignGatewayOnGnosis"],
  [ForeignChains.GNOSIS_CHIADO, "ForeignGatewayOnGnosis"],
]);

const ONE_GWEI = parseUnits("1", "gwei");

const deployForeignGateway: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId, config } = hre;
  const { deploy, execute } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to chainId %s with deployer %s", chainId, deployer);

  const foreignGatewayArtifact = foreignGatewayArtifactByChain.get(chainId) ?? ethers.constants.AddressZero;
  const foreignGateway = await deployments.get(foreignGatewayArtifact);
  console.log("using foreign gateway: %s", foreignGatewayArtifact);

  const extraData =
    "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003"; // General court, 3 jurors
  const weth = await deployments.get("WETH");

  const disputeTemplateRegistry = await deploy("DisputeTemplateRegistry", {
    from: deployer,
    args: [],
    log: true,
  });

  await deploy("ArbitrableExample", {
    from: deployer,
    args: [
      foreignGateway.address,
      disputeTemplate,
      "disputeTemplateMapping: TODO",
      extraData,
      disputeTemplateRegistry.address,
      weth.address,
    ],
    log: true,
  });

  await deploy("DisputeResolver", {
    from: deployer,
    args: [foreignGateway.address, disputeTemplateRegistry.address],
    log: true,
    maxFeePerGas: ONE_GWEI,
    maxPriorityFeePerGas: ONE_GWEI,
  });
};

deployForeignGateway.tags = ["ForeignArbitrable"];
deployForeignGateway.skip = async ({ network }) => {
  return isSkipped(network, !ForeignChains[network.config.chainId ?? 0]);
};

export default deployForeignGateway;
