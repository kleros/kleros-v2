import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

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
  
  await deploy("IncrementalNGEmitoor", {
    from: deployer,
    args: [42],
    log: true,
  });
};

deployArbitration.tags = ["RNG"];
deployArbitration.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

export default deployArbitration;
