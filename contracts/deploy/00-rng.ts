import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";
import { DisputeKitClassic, RandomizerRNG } from "../typechain-types";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

const pnkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x330bD769382cFc6d50175903434CCC8D206DCAE5"],
  [HomeChains.ARBITRUM_GOERLI, "0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610"],
]);

const randomizerByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x00"],
  [HomeChains.ARBITRUM_GOERLI, "0x57F7a8aA8291A04B325F3f0d2c4d03353d3Ef25f"],
]);

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const { AddressZero } = hre.ethers.constants;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  if (chainId === HomeChains.HARDHAT) {
    pnkByChain.set(
      HomeChains.HARDHAT,
      (
        await deploy("PNK", {
          from: deployer,
          log: true,
        })
      ).address
    );
    randomizerByChain.set(
      HomeChains.HARDHAT,
      (
        await deploy("RandomizerMock", {
          from: deployer,
          args: [],
          log: true,
        })
      ).address
    );
  }

  const randomizer = randomizerByChain.get(Number(await getChainId())) ?? AddressZero;
  const rng = await deploy("RandomizerRNG", {
    from: deployer,
    args: [randomizer, deployer],
    log: true,
  });

  const disputeKit = (await hre.ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
  await disputeKit.changeRandomNumberGenerator(rng.address, RNG_LOOKAHEAD);
};

deployArbitration.tags = ["RNG"];
deployArbitration.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

export default deployArbitration;
