import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import disputeTemplate from "../../kleros-sdk/config/v2-disputetemplate/simple/NewDisputeTemplate.simple.json";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const klerosCore = await deployments.get("KlerosCore");
  const weth = await deployments.get("WETH");

  await deploy("ArbitrableExample", {
    from: deployer,
    args: [klerosCore.address, disputeTemplate, weth.address],
    log: true,
  });

  await deploy("DisputeResolver", {
    from: deployer,
    args: [klerosCore.address],
    log: true,
  });
};

deployArbitration.tags = ["HomeArbitrable"];
deployArbitration.dependencies = ["Arbitration"];
deployArbitration.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

export default deployArbitration;
