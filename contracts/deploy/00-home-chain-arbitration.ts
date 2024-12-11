import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { changeCurrencyRate } from "./utils/klerosCoreHelper";
import { HomeChains, isSkipped, isDevnet, isMainnet, PNK, ETH } from "./utils";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet } from "./utils/deployTokens";
import { DisputeKitClassic, KlerosCore, RandomizerRNG } from "../typechain-types";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { ZeroAddress } = hre.ethers;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const dai = await deployERC20AndFaucet(hre, deployer, "DAI");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");

  await getContractOrDeploy(hre, "TransactionBatcher", { from: deployer, args: [], log: true });

  await getContractOrDeployUpgradable(hre, "PolicyRegistry", { from: deployer, args: [deployer], log: true });

  await getContractOrDeployUpgradable(hre, "EvidenceModule", { from: deployer, args: [deployer], log: true });

  // Randomizer.ai: https://randomizer.ai/docs#addresses
  const randomizerOracle = await getContractOrDeploy(hre, "RandomizerOracle", {
    from: deployer,
    contract: "RandomizerMock", // The mock is deployed only on the Hardhat network
    args: [],
    log: true,
  });

  const randomizerRng = await getContractOrDeploy(hre, "RandomizerRNG", {
    from: deployer,
    args: [deployer, ZeroAddress, randomizerOracle.target], // The SortitionModule is configured later
    log: true,
  });

  const blockhashRng = await getContractOrDeploy(hre, "BlockHashRNG", {
    from: deployer,
    args: [],
    log: true,
  });

  // RNG fallback on Arbitrum Sepolia because the Randomizer.ai oracle contract is unverified and not officially supported.
  const rng = isMainnet(hre.network) ? randomizerRng : blockhashRng;
  console.log(isMainnet(hre.network) ? "using RandomizerRNG on mainnet" : "using BlockHashRNG on testnet/devnet");

  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassic", {
    from: deployer,
    args: [deployer, ZeroAddress],
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
    args: [deployer, klerosCoreAddress, minStakingTime, maxFreezingTime, rng.target, RNG_LOOKAHEAD],
    log: true,
  }); // nonce (implementation), nonce+1 (proxy)

  const minStake = PNK(200);
  const alpha = 10000;
  const feeForJuror = ETH(0.1);
  const jurorsForCourtJump = 256;
  const klerosCore = await deployUpgradable(deployments, "KlerosCore", {
    from: deployer,
    args: [
      deployer,
      deployer,
      pnk.target,
      ZeroAddress, // KlerosCore is configured later
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      ethers.toBeHex(5), // Extra data for sortition module will return the default value of K
      sortitionModule.address,
    ],
    log: true,
  }); // nonce+2 (implementation), nonce+3 (proxy)

  // disputeKit.changeCore() only if necessary
  const disputeKitContract = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
  const currentCore = await disputeKitContract.core();
  if (currentCore !== klerosCore.address) {
    console.log(`disputeKit.changeCore(${klerosCore.address})`);
    await disputeKitContract.changeCore(klerosCore.address);
  }

  // rng.changeSortitionModule() only if necessary
  const rngContract = (await ethers.getContract("RandomizerRNG")) as RandomizerRNG;
  const currentSortitionModule = await rngContract.sortitionModule();
  if (currentSortitionModule !== sortitionModule.address) {
    console.log(`rng.changeSortitionModule(${sortitionModule.address})`);
    await rngContract.changeSortitionModule(sortitionModule.address);
  }

  const core = (await hre.ethers.getContract("KlerosCore")) as KlerosCore;
  try {
    await changeCurrencyRate(core, await pnk.getAddress(), true, 12225583, 12);
    await changeCurrencyRate(core, await dai.getAddress(), true, 60327783, 11);
    await changeCurrencyRate(core, await weth.getAddress(), true, 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }
};

deployArbitration.tags = ["Arbitration"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
