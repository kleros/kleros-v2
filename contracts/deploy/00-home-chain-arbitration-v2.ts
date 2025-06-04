import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped, isDevnet, PNK, ETH } from "./utils";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet } from "./utils/deployTokens";
import { ChainlinkRNG, DisputeKitClassic, KlerosCoreV2, StakeController, PNKVault } from "../typechain-types";

const deployArbitrationV2: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
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

  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassicV2", {
    from: deployer,
    contract: "DisputeKitClassic",
    args: [deployer, ZeroAddress],
    log: true,
  });

  // Deploy stPNK token
  const stPNK = await deploy("stPNK", {
    from: deployer,
    args: [],
    log: true,
  });

  // Deploy PNKVault
  const pnkVault = await deployUpgradable(deployments, "PNKVault", {
    from: deployer,
    args: [deployer, pnk.target, stPNK.address],
    log: true,
  });

  // Calculate future addresses for circular dependencies
  let klerosCoreV2Address = await deployments.getOrNull("KlerosCoreV2").then((deployment) => deployment?.address);
  if (!klerosCoreV2Address) {
    const nonce = await ethers.provider.getTransactionCount(deployer);
    klerosCoreV2Address = getContractAddress(deployer, nonce + 5); // // deployed on the 6th tx (nonce+3): SortitionModule Impl tx, SortitionModule Proxy tx, StakeController Impl tx, StakeController Proxy tx, KlerosCore Impl tx, KlerosCore Proxy tx
    console.log("calculated future KlerosCoreV2 address for nonce %d: %s", nonce + 5, klerosCoreV2Address);
  } else {
    console.log("using existing KlerosCoreV2 address: %s", klerosCoreV2Address);
  }

  const devnet = isDevnet(hre.network);
  const minStakingTime = devnet ? 180 : 1800;
  const maxDrawingTime = devnet ? 600 : 1800;
  const rng = (await ethers.getContract("ChainlinkRNG")) as ChainlinkRNG;

  // Deploy SortitionModuleV2
  const sortitionModuleV2 = await deployUpgradable(deployments, "SortitionModuleV2", {
    from: deployer,
    args: [deployer, stakeControllerAddress],
    log: true,
  }); // nonce (implementation), nonce+1 (proxy)

  // Deploy StakeController (only if not already deployed)
  const stakeController = await getContractOrDeployUpgradable(hre, "StakeController", {
    from: deployer,
    args: [
      deployer,
      klerosCoreV2Address,
      pnkVault.address,
      sortitionModuleV2.address,
      rng.target,
      minStakingTime,
      maxDrawingTime,
      RNG_LOOKAHEAD,
    ],
    log: true,
  });

  const minStake = PNK(200);
  const alpha = 10000;
  const feeForJuror = ETH(0.1);
  const jurorsForCourtJump = 256;

  // Deploy KlerosCoreV2 (only if not already deployed)
  const klerosCoreV2 = await getContractOrDeployUpgradable(hre, "KlerosCoreV2", {
    from: deployer,
    args: [
      deployer,
      deployer,
      pnk.target,
      ZeroAddress, // KlerosCoreV2 is configured later
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      ethers.toBeHex(5), // Extra data for sortition module will return the default value of K
      stakeController.target,
    ],
    log: true,
  });

  // Configure cross-dependencies
  console.log("Configuring cross-dependencies...");

  // Configure stPNK token to allow PNKVault operations
  const stPNKContract = await ethers.getContractAt("stPNK", stPNK.address);
  const currentVault = await stPNKContract.vault();
  if (currentVault !== pnkVault.address) {
    console.log(`stPNK.changeVault(${pnkVault.address})`);
    await stPNKContract.changeVault(pnkVault.address);
  }

  // disputeKit.changeCore() only if necessary
  const disputeKitContract = (await ethers.getContract("DisputeKitClassicV2")) as DisputeKitClassic;
  const currentCore = await disputeKitContract.core();
  if (currentCore !== klerosCoreV2.target) {
    console.log(`disputeKit.changeCore(${klerosCoreV2.target})`);
    await disputeKitContract.changeCore(klerosCoreV2.target);
  }

  // rng.changeSortitionModule() only if necessary
  const rngSortitionModule = await rng.sortitionModule();
  if (rngSortitionModule !== stakeController.target) {
    console.log(`rng.changeSortitionModule(${stakeController.target})`);
    await rng.changeSortitionModule(stakeController.target);
  }

  const core = (await hre.ethers.getContract("KlerosCoreV2")) as KlerosCoreV2;
  try {
    // Manually set currency rates since changeCurrencyRate helper doesn't support V2 types yet
    console.log("Setting PNK currency rate...");
    await core.changeAcceptedFeeTokens(await pnk.getAddress(), true);
    await core.changeCurrencyRates(await pnk.getAddress(), 12225583, 12);

    console.log("Setting DAI currency rate...");
    await core.changeAcceptedFeeTokens(await dai.getAddress(), true);
    await core.changeCurrencyRates(await dai.getAddress(), 60327783, 11);

    console.log("Setting WETH currency rate...");
    await core.changeAcceptedFeeTokens(await weth.getAddress(), true);
    await core.changeCurrencyRates(await weth.getAddress(), 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }

  await deploy("KlerosCoreV2SnapshotProxy", {
    from: deployer,
    contract: "KlerosCoreSnapshotProxy",
    args: [deployer, core.target],
    log: true,
  });

  console.log("✅ V2 Architecture deployment completed successfully!");
  console.log(`📦 PNKVault: ${pnkVault.address}`);
  console.log(`🎫 stPNK: ${stPNK.address}`);
  console.log(`🎯 SortitionModuleV2: ${sortitionModuleV2.address}`);
  console.log(`🎮 StakeController: ${stakeController.target}`);
  console.log(`⚖️ KlerosCoreV2: ${klerosCoreV2.target}`);
};

deployArbitrationV2.tags = ["ArbitrationV2"];
deployArbitrationV2.dependencies = ["ChainlinkRNG"];
deployArbitrationV2.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitrationV2;
