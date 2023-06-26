import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";
import getContractAddress from "../deploy-helpers/getContractAddress";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
  KLEROS_CHAIN = 203012,
}

const pnkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x330bD769382cFc6d50175903434CCC8D206DCAE5"],
  [HomeChains.ARBITRUM_GOERLI, "0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610"],
]);

// https://randomizer.ai/docs#addresses
const randomizerByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF"],
  [HomeChains.ARBITRUM_GOERLI, "0x923096Da90a3b60eb7E12723fA2E1547BA9236Bc"],
]);

const daiByChain = new Map<HomeChains, string>([[HomeChains.ARBITRUM_ONE, "??"]]);
const wethByChain = new Map<HomeChains, string>([[HomeChains.ARBITRUM_ONE, "??"]]);

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const { AddressZero } = hre.ethers.constants;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Deploying to %s with deployer %s", HomeChains[chainId], deployer);

  if (!pnkByChain.get(chainId)) {
    const erc20Address = await deployERC20(hre, deployer, "PNK");
    pnkByChain.set(HomeChains[HomeChains[chainId]], erc20Address);
  }
  if (!daiByChain.get(chainId)) {
    const erc20Address = await deployERC20(hre, deployer, "DAI");
    daiByChain.set(HomeChains[HomeChains[chainId]], erc20Address);
  }
  if (!wethByChain.get(chainId)) {
    const erc20Address = await deployERC20(hre, deployer, "WETH");
    wethByChain.set(HomeChains[HomeChains[chainId]], erc20Address);
  }

  if (!randomizerByChain.get(chainId)) {
    const randomizerMock = await deploy("RandomizerMock", {
      from: deployer,
      args: [],
      log: true,
    });
    randomizerByChain.set(HomeChains[HomeChains[chainId]], randomizerMock.address);
  }

  await deploy("PolicyRegistry", {
    from: deployer,
    args: [deployer],
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
    args: [deployer, AddressZero],
    log: true,
  });

  const nonce = await ethers.provider.getTransactionCount(deployer);
  const KlerosCoreAddress = getContractAddress(deployer, nonce + 1);
  console.log("calculated future KlerosCore address for nonce %d: %s", nonce, KlerosCoreAddress);

  const sortitionModule = await deploy("SortitionModule", {
    from: deployer,
    args: [deployer, KlerosCoreAddress, 1800, 1800, rng.address, RNG_LOOKAHEAD], // minStakingTime, maxFreezingTime
    log: true,
  });

  const pnk = pnkByChain.get(chainId) ?? AddressZero;
  const dai = daiByChain.get(chainId) ?? AddressZero;
  const weth = wethByChain.get(chainId) ?? AddressZero;
  const minStake = BigNumber.from(10).pow(20).mul(2);
  const alpha = 10000;
  const feeForJuror = BigNumber.from(10).pow(17);
  const klerosCore = await deploy("KlerosCore", {
    from: deployer,
    args: [
      deployer,
      pnk,
      AddressZero,
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, 256], // minStake, alpha, feeForJuror, jurorsForCourtJump
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      0xfa, // Extra data for sortition module will return the default value of K
      sortitionModule.address,
    ],
    log: true,
  });

  // execute DisputeKitClassic.changeCore() only if necessary
  const currentCore = await hre.ethers.getContractAt("DisputeKitClassic", disputeKit.address).then((dk) => dk.core());
  if (currentCore !== klerosCore.address) {
    await execute("DisputeKitClassic", { from: deployer, log: true }, "changeCore", klerosCore.address);
  }

  await execute("KlerosCore", { from: deployer, log: true }, "changeAcceptedFeeTokens", pnk, true);
  await execute("KlerosCore", { from: deployer, log: true }, "changeAcceptedFeeTokens", dai, true);
  await execute("KlerosCore", { from: deployer, log: true }, "changeAcceptedFeeTokens", weth, true);

  await execute("KlerosCore", { from: deployer, log: true }, "changeCurrencyRates", pnk, 12225583, 12);
  await execute("KlerosCore", { from: deployer, log: true }, "changeCurrencyRates", dai, 60327783, 11);
  await execute("KlerosCore", { from: deployer, log: true }, "changeCurrencyRates", weth, 1, 1);
};

deployArbitration.tags = ["Arbitration"];
deployArbitration.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

const deployERC20 = async (hre: HardhatRuntimeEnvironment, deployer: string, ticker: string) => {
  const { deploy } = hre.deployments;
  const erc20 = await deploy(ticker, {
    from: deployer,
    contract: "TestERC20",
    args: [ticker, ticker],
    log: true,
  });
  console.log("Deployed %s at %s", ticker, erc20.address);
  return erc20.address;
};

export default deployArbitration;
