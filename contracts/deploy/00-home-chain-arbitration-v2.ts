import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped, isDevnet, PNK, ETH } from "./utils";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet } from "./utils/deployTokens";
import { ChainlinkRNG, DisputeKitClassic, KlerosCoreV2, StakeController, Vault } from "../typechain-types";
import { changeCurrencyRate } from "./utils/klerosCoreHelper";

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
    args: [
      deployer,
      ZeroAddress, // Placeholder for KlerosCoreV2 address, configured later
    ],
    log: true,
  });

  // Calculate future addresses for circular dependencies
  const nonce = await ethers.provider.getTransactionCount(deployer);

  const vaultAddress = getContractAddress(deployer, nonce + 3); // deployed on the 4th tx (nonce+3): stPNK Impl tx, stPNK Proxy tx, Vault Impl tx, Vault Proxy tx
  console.log("calculated future Vault address for nonce %d: %s", nonce + 3, vaultAddress);

  const stakeControllerAddress = getContractAddress(deployer, nonce + 7); // deployed on the 8th tx (nonce+7): StakeController Impl tx, StakeController Proxy tx
  console.log("calculated future StakeController address for nonce %d: %s", nonce + 7, stakeControllerAddress);

  const klerosCoreV2Address = getContractAddress(deployer, nonce + 9); // deployed on the 10th tx (nonce+9): SortitionModule Impl tx, SortitionModule Proxy tx, StakeController Impl tx, StakeController Proxy tx, KlerosCore Impl tx, KlerosCore Proxy tx
  console.log("calculated future KlerosCoreV2 address for nonce %d: %s", nonce + 9, klerosCoreV2Address);

  const stPNK = await deployUpgradable(deployments, "stPNK", {
    from: deployer,
    args: [deployer, vaultAddress],
    log: true,
  }); // nonce (implementation), nonce+1 (proxy)

  const vault = await deployUpgradable(deployments, "Vault", {
    from: deployer,
    args: [deployer, pnk.target, stPNK.address, stakeControllerAddress, klerosCoreV2Address],
    log: true,
  }); // nonce + 2 (implementation), nonce + 3 (proxy)

  // Deploy SortitionModuleV2
  const sortitionModuleV2 = await deployUpgradable(deployments, "SortitionModuleV2", {
    from: deployer,
    args: [deployer, stakeControllerAddress],
    log: true,
  }); // nonce + 4 (implementation), nonce + 5 (proxy)

  // Deploy StakeController (only if not already deployed)
  const devnet = isDevnet(hre.network);
  const minStakingTime = devnet ? 180 : 1800;
  const maxDrawingTime = devnet ? 600 : 1800;
  const rng = (await ethers.getContract("ChainlinkRNG")) as ChainlinkRNG;
  const stakeController = await deployUpgradable(deployments, "StakeController", {
    from: deployer,
    args: [
      deployer,
      klerosCoreV2Address,
      vault.address,
      sortitionModuleV2.address,
      rng.target,
      minStakingTime,
      maxDrawingTime,
      RNG_LOOKAHEAD,
    ],
    log: true,
  }); // nonce + 6 (implementation), nonce + 7 (proxy)

  const minStake = PNK(200);
  const alpha = 10000;
  const feeForJuror = ETH(0.1);
  const jurorsForCourtJump = 256;

  // Deploy KlerosCoreV2 (only if not already deployed)
  const klerosCoreV2 = await deployUpgradable(deployments, "KlerosCoreV2", {
    from: deployer,
    args: [
      deployer,
      deployer,
      ZeroAddress, // JurorProsecutionModule, not implemented yet
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      ethers.toBeHex(5), // Extra data for sortition module will return the default value of K
      stakeController.address,
      vault.address,
    ],
    log: true,
  });

  // Configure cross-dependencies
  console.log("Configuring cross-dependencies...");

  // disputeKit.changeCore() only if necessary
  const disputeKitContract = (await ethers.getContract("DisputeKitClassicV2")) as DisputeKitClassic;
  const currentCore = await disputeKitContract.core();
  if (currentCore !== klerosCoreV2.address) {
    console.log(`disputeKit.changeCore(${klerosCoreV2.address})`);
    await disputeKitContract.changeCore(klerosCoreV2.address);
  }

  // rng.changeSortitionModule() only if necessary
  // Note: the RNG's `sortitionModule` variable is misleading, it's only for access control and should be renamed to `consumer`.
  const rngSortitionModule = await rng.sortitionModule();
  if (rngSortitionModule !== stakeController.address) {
    console.log(`rng.changeSortitionModule(${stakeController.address})`);
    await rng.changeSortitionModule(stakeController.address);
  }

  const core = (await hre.ethers.getContract("KlerosCoreV2")) as KlerosCoreV2;
  try {
    await changeCurrencyRate(core, await pnk.getAddress(), true, 12225583, 12);
    await changeCurrencyRate(core, await dai.getAddress(), true, 60327783, 11);
    await changeCurrencyRate(core, await weth.getAddress(), true, 1, 1);
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
  console.log(`📦 Vault: ${vault.address}`);
  console.log(`🎫 stPNK: ${stPNK.address}`);
  console.log(`🎯 SortitionModuleV2: ${sortitionModuleV2.address}`);
  console.log(`🎮 StakeController: ${stakeController.address}`);
  console.log(`⚖️ KlerosCoreV2: ${klerosCoreV2.address}`);
};

deployArbitrationV2.tags = ["ArbitrationV2"];
deployArbitrationV2.dependencies = ["ChainlinkRNG"];
deployArbitrationV2.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitrationV2;
