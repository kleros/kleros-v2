import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";

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
  [HomeChains.ARBITRUM_GOERLI, "0xE1B6CcAc0BB0355C01A049e78909231Bfa13620B"],
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

  await deploy("PolicyRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  await deploy("BlockHashRNG", {
    from: deployer,
    args: [],
    log: true,
  });

  const randomizer = randomizerByChain.get(Number(await getChainId())) ?? AddressZero;
  const rng = await deploy("RandomizerRNG", {
    from: deployer,
    args: [randomizer, deployer],
    log: true,
  });

  const disputeKit = await deploy("DisputeKitClassic", {
    from: deployer,
    args: [deployer, AddressZero, rng.address, RNG_LOOKAHEAD],
    log: true,
  });

  const sortitionSumTreeLibrary = await deploy("SortitionSumTreeFactory", {
    from: deployer,
    log: true,
  });

  const pnk = pnkByChain.get(Number(await getChainId())) ?? AddressZero;
  const minStake = BigNumber.from(10).pow(20).mul(2);
  const alpha = 10000;
  const feeForJuror = BigNumber.from(10).pow(17);
  const klerosCore = await deploy("KlerosCore", {
    from: deployer,
    libraries: {
      SortitionSumTreeFactory: sortitionSumTreeLibrary.address,
    },
    args: [
      deployer,
      pnk,
      AddressZero,
      disputeKit.address,
      [1800, 1800], // minStakingTime, maxFreezingTime
      false,
      [minStake, alpha, feeForJuror, 3], // minStake, alpha, feeForJuror, jurorsForCourtJump
      [0, 0, 0, 0], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      3,
    ],
    log: true,
  });

  // execute DisputeKitClassic.changeCore() only if necessary
  const currentCore = await hre.ethers.getContractAt("DisputeKitClassic", disputeKit.address).then((dk) => dk.core());
  if (currentCore !== klerosCore.address) {
    await execute("DisputeKitClassic", { from: deployer, log: true }, "changeCore", klerosCore.address);
  }

  await deploy("DisputeResolver", {
    from: deployer,
    args: [klerosCore.address],
    log: true,
  });
};

deployArbitration.tags = ["HomeChain", "Arbitration"];
deployArbitration.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

export default deployArbitration;
