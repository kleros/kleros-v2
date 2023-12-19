import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";
import getContractAddress from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped, isDevnet } from "./utils";

const pnkByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x330bD769382cFc6d50175903434CCC8D206DCAE5"],
  [HomeChains.ARBITRUM_SEPOLIA, "INSERT ARBITRUM SEPOLIA PNK TOKEN ADDRESS HERE"],
]);

// https://randomizer.ai/docs#addresses
const randomizerByChain = new Map<HomeChains, string>([
  [HomeChains.ARBITRUM_ONE, "0x5b8bB80f2d72D0C85caB8fB169e8170A05C94bAF"],
  [HomeChains.ARBITRUM_SEPOLIA, "INSERT ARBITRUM SEPOLIA RANDOMIZER ADDRESS HERE"],
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
    const erc20Address = await deployERC20AndFaucet(hre, deployer, "PNK");
    pnkByChain.set(HomeChains[HomeChains[chainId]], erc20Address);
  }
  if (!daiByChain.get(chainId)) {
    const erc20Address = await deployERC20AndFaucet(hre, deployer, "DAI");
    daiByChain.set(HomeChains[HomeChains[chainId]], erc20Address);
  }
  if (!wethByChain.get(chainId)) {
    const erc20Address = await deployERC20AndFaucet(hre, deployer, "WETH");
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

  await deployUpgradable(deployments, "PolicyRegistry", { from: deployer, args: [deployer], log: true });

  await deployUpgradable(deployments, "EvidenceModule", { from: deployer, args: [deployer], log: true });

  const randomizer = randomizerByChain.get(Number(await getChainId())) ?? AddressZero;
  const rng = await deployUpgradable(deployments, "RandomizerRNG", {
    from: deployer,
    args: [randomizer, deployer],
    log: true,
  });

  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassic", {
    from: deployer,
    args: [deployer, AddressZero],
    log: true,
  });

  let klerosCoreAddress = await deployments.getOrNull("KlerosCore").then((deployment) => deployment?.address);
  if (!klerosCoreAddress) {
    const nonce = await ethers.provider.getTransactionCount(deployer);
    klerosCoreAddress = getContractAddress(deployer, nonce + 3); // deployed on the 4th tx (nonce+3): SortitionModule Impl tx, SortitionModule Proxy tx, KlerosCore Impl tx, KlerosCore Proxy tx
    console.log("calculated future KlerosCore address for nonce %d: %s", nonce + 3, klerosCoreAddress);
  }
  const devnet = isDevnet(hre.network);
  const minStakingTime = devnet ? 180 : 1800;
  const maxFreezingTime = devnet ? 600 : 1800;
  const sortitionModule = await deployUpgradable(deployments, "SortitionModule", {
    from: deployer,
    args: [deployer, klerosCoreAddress, minStakingTime, maxFreezingTime, rng.address, RNG_LOOKAHEAD],
    log: true,
  }); // nonce (implementation), nonce+1 (proxy)

  const pnk = pnkByChain.get(chainId) ?? AddressZero;
  const dai = daiByChain.get(chainId) ?? AddressZero;
  const weth = wethByChain.get(chainId) ?? AddressZero;
  const minStake = BigNumber.from(10).pow(20).mul(2);
  const alpha = 10000;
  const feeForJuror = BigNumber.from(10).pow(17);
  const klerosCore = await deployUpgradable(deployments, "KlerosCore", {
    from: deployer,
    args: [
      deployer,
      pnk,
      AddressZero,
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, 256], // minStake, alpha, feeForJuror, jurorsForCourtJump
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      ethers.utils.hexlify(5), // Extra data for sortition module will return the default value of K
      sortitionModule.address,
    ],
    log: true,
  }); // nonce+2 (implementation), nonce+3 (proxy)

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
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

const deployERC20AndFaucet = async (
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  ticker: string
): Promise<string> => {
  const { deploy } = hre.deployments;
  const erc20 = await deploy(ticker, {
    from: deployer,
    contract: "TestERC20",
    args: [ticker, ticker],
    log: true,
  });
  const faucet = await deploy(`${ticker}Faucet`, {
    from: deployer,
    contract: "Faucet",
    args: [erc20.address],
    log: true,
  });
  const funding = hre.ethers.utils.parseUnits("100000");
  const erc20Instance = await hre.ethers.getContract(ticker);
  const faucetBalance = await erc20Instance.balanceOf(faucet.address);
  const deployerBalance = await erc20Instance.balanceOf(deployer);
  if (deployerBalance.gte(funding) && faucetBalance.isZero()) {
    console.log("Funding %sFaucet with %d", ticker, funding);
    await erc20Instance.transfer(faucet.address, funding);
  }
  return erc20.address;
};

export default deployArbitration;
