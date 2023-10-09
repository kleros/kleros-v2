import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import disputeTemplate from "../test/fixtures/DisputeTemplate.simple.json";
import { isSkipped } from "./utils";

enum Chains {
  GOERLI = 5,
  HARDHAT = 31337,
}

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to %s with deployer %s", Chains[chainId], deployer);

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
