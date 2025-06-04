import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped, isDevnet, PNK, ETH } from "./utils";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet, deployERC721 } from "./utils/deployTokens";
import { ChainlinkRNG, DisputeKitClassic, KlerosCoreV2Neo, StakeControllerNeo, PNKVaultNeo } from "../typechain-types";

const deployArbitrationV2Neo: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
  const { ZeroAddress } = hre.ethers;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");
  const nft = await deployERC721(hre, deployer, "Kleros V2 Neo Early User", "KlerosV2NeoEarlyUser");

  await getContractOrDeploy(hre, "TransactionBatcher", { from: deployer, args: [], log: true });

  await deployUpgradable(deployments, "PolicyRegistry", { from: deployer, args: [deployer], log: true });

  await deployUpgradable(deployments, "EvidenceModule", { from: deployer, args: [deployer], log: true });

  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassicV2Neo", {
    from: deployer,
    contract: "DisputeKitClassic",
    args: [deployer, ZeroAddress],
    log: true,
  });

  // Deploy stPNK token
  const stPNK = await deploy("stPNK", {
    from: deployer,
    contract: "stPNK",
    args: [],
    log: true,
  });

  // Deploy PNKVaultNeo
  const pnkVaultNeo = await deployUpgradable(deployments, "PNKVaultNeo", {
    from: deployer,
    args: [deployer, pnk.target, stPNK.address],
    log: true,
  });

  // Calculate future addresses for circular dependencies
  let stakeControllerNeoAddress = await deployments
    .getOrNull("StakeControllerNeo")
    .then((deployment) => deployment?.address);
  let klerosCoreV2NeoAddress = await deployments.getOrNull("KlerosCoreV2Neo").then((deployment) => deployment?.address);

  const nonce = await ethers.provider.getTransactionCount(deployer);
  let currentNonce = nonce + 2; // After SortitionModuleV2Neo impl+proxy

  if (!stakeControllerNeoAddress) {
    stakeControllerNeoAddress = getContractAddress(deployer, currentNonce + 1); // proxy address
    console.log(
      "calculated future StakeControllerNeo address for nonce %d: %s",
      currentNonce + 1,
      stakeControllerNeoAddress
    );
    currentNonce += 2; // impl + proxy
  } else {
    console.log("using existing StakeControllerNeo address: %s", stakeControllerNeoAddress);
  }

  if (!klerosCoreV2NeoAddress) {
    klerosCoreV2NeoAddress = getContractAddress(deployer, currentNonce + 1); // proxy address
    console.log("calculated future KlerosCoreV2Neo address for nonce %d: %s", currentNonce + 1, klerosCoreV2NeoAddress);
  } else {
    console.log("using existing KlerosCoreV2Neo address: %s", klerosCoreV2NeoAddress);
  }

  const devnet = isDevnet(hre.network);
  const minStakingTime = devnet ? 180 : 1800;
  const maxDrawingTime = devnet ? 600 : 1800;
  const rng = (await ethers.getContract("ChainlinkRNG")) as ChainlinkRNG;
  const maxStakePerJuror = PNK(2_000);
  const maxTotalStaked = PNK(2_000_000);

  // Deploy SortitionModuleV2Neo
  const sortitionModuleV2Neo = await deployUpgradable(deployments, "SortitionModuleV2Neo", {
    from: deployer,
    args: [deployer, stakeControllerNeoAddress, maxStakePerJuror, maxTotalStaked],
    log: true,
  }); // nonce (implementation), nonce+1 (proxy)

  // Deploy StakeControllerNeo (only if not already deployed)
  const stakeControllerNeo = await getContractOrDeployUpgradable(hre, "StakeControllerNeo", {
    from: deployer,
    args: [
      deployer,
      klerosCoreV2NeoAddress,
      pnkVaultNeo.address,
      sortitionModuleV2Neo.address,
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

  // Deploy KlerosCoreV2Neo (only if not already deployed)
  const klerosCoreV2Neo = await getContractOrDeployUpgradable(hre, "KlerosCoreV2Neo", {
    from: deployer,
    args: [
      deployer,
      deployer,
      pnk.target,
      ZeroAddress, // jurorProsecutionModule is not implemented yet
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      ethers.toBeHex(5), // Extra data for sortition module will return the default value of K
      stakeControllerNeo.target,
      nft.target,
    ],
    log: true,
  });

  // Configure cross-dependencies
  console.log("Configuring cross-dependencies...");

  // Configure stPNK token to allow PNKVaultNeo operations
  const stPNKContract = await ethers.getContractAt("stPNK", stPNK.address);
  const currentVault = await stPNKContract.vault();
  if (currentVault !== pnkVaultNeo.address) {
    console.log(`stPNK.setVault(${pnkVaultNeo.address})`);
    await stPNKContract.setVault(pnkVaultNeo.address);
  }

  // disputeKit.changeCore() only if necessary
  const disputeKitContract = (await ethers.getContract("DisputeKitClassicV2Neo")) as DisputeKitClassic;
  const currentCore = await disputeKitContract.core();
  if (currentCore !== klerosCoreV2Neo.target) {
    console.log(`disputeKit.changeCore(${klerosCoreV2Neo.target})`);
    await disputeKitContract.changeCore(klerosCoreV2Neo.target);
  }

  // rng.changeSortitionModule() only if necessary
  const rngSortitionModule = await rng.sortitionModule();
  if (rngSortitionModule !== stakeControllerNeo.target) {
    console.log(`rng.changeSortitionModule(${stakeControllerNeo.target})`);
    await rng.changeSortitionModule(stakeControllerNeo.target);
  }

  const core = (await hre.ethers.getContract("KlerosCoreV2Neo")) as KlerosCoreV2Neo;
  try {
    // Manually set currency rates
    console.log("Setting WETH currency rate...");
    await core.changeAcceptedFeeTokens(await weth.getAddress(), true);
    await core.changeCurrencyRates(await weth.getAddress(), 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }

  const disputeTemplateRegistry = await getContractOrDeployUpgradable(hre, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  const resolver = await deploy("DisputeResolverV2Neo", {
    from: deployer,
    contract: "DisputeResolver",
    args: [core.target, disputeTemplateRegistry.target],
    log: true,
  });

  console.log(`core.changeArbitrableWhitelist(${resolver.address}, true)`);
  await core.changeArbitrableWhitelist(resolver.address, true);

  await deploy("KlerosCoreV2NeoSnapshotProxy", {
    from: deployer,
    contract: "KlerosCoreSnapshotProxy",
    args: [deployer, core.target],
    log: true,
  });

  console.log("✅ V2 Neo Architecture deployment completed successfully!");
  console.log(`📦 PNKVaultNeo: ${pnkVaultNeo.address}`);
  console.log(`🎫 stPNKNeo: ${stPNK.address}`);
  console.log(`🎯 SortitionModuleV2Neo: ${sortitionModuleV2Neo.address}`);
  console.log(`🎮 StakeControllerNeo: ${stakeControllerNeo.target}`);
  console.log(`⚖️ KlerosCoreV2Neo: ${klerosCoreV2Neo.target}`);
  console.log(`🎨 JurorNFT: ${nft.target}`);
  console.log(`🔐 DisputeResolver: ${resolver.address}`);
};

deployArbitrationV2Neo.tags = ["ArbitrationV2Neo"];
deployArbitrationV2Neo.dependencies = ["ChainlinkRNG"];
deployArbitrationV2Neo.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitrationV2Neo;
