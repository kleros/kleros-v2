import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { changeCurrencyRate } from "./utils/klerosCoreHelper";
import { HomeChains, isSkipped, isDevnet, PNK, ETH, Courts } from "./utils";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet } from "./utils/deployTokens";
import { ChainlinkRNG, DisputeKitClassic, KlerosCore, RNGWithFallback } from "../typechain-types";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
  const { ZeroAddress } = hre.ethers;

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

  await deployUpgradable(deployments, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  const classicDisputeKitID = 1; // Classic DK
  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassic", {
    from: deployer,
    args: [deployer, ZeroAddress, weth.target, classicDisputeKitID],
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
  const rngWithFallback = await ethers.getContract<RNGWithFallback>("RNGWithFallback");
  const sortitionModule = await deployUpgradable(deployments, "SortitionModule", {
    from: deployer,
    args: [deployer, klerosCoreAddress, minStakingTime, maxFreezingTime, rngWithFallback.target],
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
      weth.target,
    ],
    log: true,
  }); // nonce+2 (implementation), nonce+3 (proxy)

  // disputeKit.changeCore() only if necessary
  const disputeKitContract = await ethers.getContract<DisputeKitClassic>("DisputeKitClassic");
  const currentCore = await disputeKitContract.core();
  if (currentCore !== klerosCore.address) {
    console.log(`disputeKit.changeCore(${klerosCore.address})`);
    await disputeKitContract.changeCore(klerosCore.address);
  }

  // rngWithFallback.changeConsumer() only if necessary
  const rngConsumer = await rngWithFallback.consumer();
  if (rngConsumer !== sortitionModule.address) {
    console.log(`rngWithFallback.changeConsumer(${sortitionModule.address})`);
    await rngWithFallback.changeConsumer(sortitionModule.address);
  }

  const core = await hre.ethers.getContract<KlerosCore>("KlerosCore");
  try {
    await changeCurrencyRate(core, await pnk.getAddress(), true, 12225583, 12);
    await changeCurrencyRate(core, await dai.getAddress(), true, 60327783, 11);
    await changeCurrencyRate(core, await weth.getAddress(), true, 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }

  // Extra dispute kits
  const disputeKitShutter = await deployUpgradable(deployments, "DisputeKitShutter", {
    from: deployer,
    args: [deployer, core.target, weth.target, classicDisputeKitID],
    log: true,
  });
  await core.addNewDisputeKit(disputeKitShutter.address);
  const disputeKitShutterID = Number(await core.getDisputeKitsLength());
  await core.enableDisputeKits(Courts.GENERAL, [disputeKitShutterID], true); // enable disputeKitShutter on the General Court

  const disputeKitGated = await deployUpgradable(deployments, "DisputeKitGated", {
    from: deployer,
    args: [deployer, core.target, weth.target, classicDisputeKitID],
    log: true,
  });
  await core.addNewDisputeKit(disputeKitGated.address);
  const disputeKitGatedID = Number(await core.getDisputeKitsLength());
  await core.enableDisputeKits(Courts.GENERAL, [disputeKitGatedID], true); // enable disputeKitGated on the General Court

  const disputeKitGatedShutter = await deployUpgradable(deployments, "DisputeKitGatedShutter", {
    from: deployer,
    args: [deployer, core.target, weth.target, disputeKitShutterID], // Does not jump to DKClassic
    log: true,
  });
  await core.addNewDisputeKit(disputeKitGatedShutter.address);
  const disputeKitGatedShutterID = Number(await core.getDisputeKitsLength());
  await core.enableDisputeKits(Courts.GENERAL, [disputeKitGatedShutterID], true); // enable disputeKitGatedShutter on the General Court

  // Snapshot proxy
  await deploy("KlerosCoreSnapshotProxy", {
    from: deployer,
    args: [deployer, core.target],
    log: true,
  });
};

deployArbitration.tags = ["Arbitration"];
deployArbitration.dependencies = ["ChainlinkRNG"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
