import { parseUnits } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

enum ForeignChains {
  GNOSIS_MAINNET = 100,
  GNOSIS_CHIADO = 10200,
  HARDHAT = 31337,
}

const ONE_GWEI = parseUnits("1", "gwei");

const deployResolver: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to chainId %s with deployer %s", chainId, deployer);

  const foreignGateway = await deployments.get("ForeignGatewayOnGnosis");
  const disputeTemplateRegistry = await deployments.get("DisputeTemplateRegistry");

  await deploy("DisputeResolver", {
    from: deployer,
    args: [foreignGateway.address, disputeTemplateRegistry.address],
    log: true,
    maxFeePerGas: ONE_GWEI,
    maxPriorityFeePerGas: ONE_GWEI,
  });
};

deployResolver.tags = ["ResolverOnGnosis"];
deployResolver.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !ForeignChains[chainId];
};

export default deployResolver;
