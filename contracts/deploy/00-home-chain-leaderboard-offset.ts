import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HomeChains, isSkipped } from "./utils";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";

const deployLeaderboardOffset: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, getChainId } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  await getContractOrDeploy(hre, "LeaderboardOffset", {
    from: deployer,
    args: [deployer],
    log: true,
  });
};

deployLeaderboardOffset.tags = ["LeaderboardOffset"];
deployLeaderboardOffset.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployLeaderboardOffset;
