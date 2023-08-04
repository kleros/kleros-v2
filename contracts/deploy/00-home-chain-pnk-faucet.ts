import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

const pnkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x330bD769382cFc6d50175903434CCC8D206DCAE5"],
  [HomeChains.ARBITRUM_GOERLI, "0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610"],
]);

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to %s with deployer %s", HomeChains[chainId], deployer);

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
      hre.ethers.utils.parseUnits("200", "ether")
    );
  }
};

deployArbitration.tags = ["PnkFaucet"];
deployArbitration.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

export default deployArbitration;
