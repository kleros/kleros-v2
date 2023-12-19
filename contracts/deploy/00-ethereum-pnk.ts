import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ForeignChains, HardhatChain, isSkipped } from "./utils";

enum Chains {
  SEPOLIA = ForeignChains.ETHEREUM_SEPOLIA,
  HARDHAT = HardhatChain.HARDHAT,
}

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", Chains[chainId], deployer);

  await deploy("PinakionV2", {
    from: deployer,
    args: [],
    log: true,
  });
};

deployArbitration.tags = ["Pinakion"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !Chains[network.config.chainId ?? 0]);
};

export default deployArbitration;
