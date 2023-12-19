import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HomeChains, isSkipped } from "./utils";

const pnkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x330bD769382cFc6d50175903434CCC8D206DCAE5"],
  [HomeChains.ARBITRUM_SEPOLIA, "INSERT ARBITRUM SEPOLIA PNK TOKEN ADDRESS HERE"],
]);

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnkAddress = pnkByChain.get(chainId);
  if (pnkAddress) {
    await deploy("PNKFaucet", {
      from: deployer,
      contract: "Faucet",
      args: [pnkAddress],
      log: true,
    });
    await execute(
      "PNKFaucet",
      { from: deployer, log: true },
      "changeAmount",
      hre.ethers.utils.parseUnits("10000", "ether")
    );
  }
};

deployArbitration.tags = ["PnkFaucet"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
