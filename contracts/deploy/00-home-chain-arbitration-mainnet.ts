import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { changeCurrencyRate } from "./utils/klerosCoreHelper";
import { HomeChains, isSkipped, isDevnet, PNK, ETH, ONE_MINUTE_IN_SECONDS } from "./utils";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet, deployERC721 } from "./utils/deployTokens";
import { DisputeKitClassic, KlerosCore, RatesConverter, RNGWithFallback } from "../typechain-types";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
  const { ZeroAddress } = hre.ethers;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");
  const nft = await deployERC721(hre, deployer, "Kleros V2 Neo Early User", "KlerosV2NeoEarlyUser");

  const ratesConverter = await getContractOrDeploy<RatesConverter>(hre, "RatesConverter", {
    from: deployer,
    args: [],
    log: true,
  });

  await getContractOrDeploy(hre, "TransactionBatcher", {
    from: deployer,
    args: [],
    log: true,
  });

  await deployUpgradable(deployments, "PolicyRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  await deployUpgradable(deployments, "EvidenceModule", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassic", {
    from: deployer,
    args: [deployer, ZeroAddress, weth.target],
    log: true,
  });

  let klerosCoreAddress = await deployments.getOrNull("KlerosCore").then((deployment) => deployment?.address);
  if (!klerosCoreAddress) {
    const nonce = await ethers.provider.getTransactionCount(deployer);
    // deployed on the 4th tx (nonce+3):
    // SortitionModule Impl tx, SortitionModule Proxy tx, KlerosCore Impl tx, KlerosCore Proxy tx
    klerosCoreAddress = getContractAddress(deployer, nonce + 3);
    console.log("calculated future KlerosCore address for nonce %d: %s", nonce + 3, klerosCoreAddress);
  }
  const devnet = isDevnet(hre.network);
  const minStakingTime = devnet ? 3 * ONE_MINUTE_IN_SECONDS : 30 * ONE_MINUTE_IN_SECONDS;
  const maxFreezingTime = devnet ? 10 * ONE_MINUTE_IN_SECONDS : 30 * ONE_MINUTE_IN_SECONDS;
  const rngWithFallback = await ethers.getContract<RNGWithFallback>("RNGWithFallback");
  const maxStakePerJuror = PNK(2_000);
  const maxTotalStaked = PNK(2_000_000);
  const sortitionModule = await deployUpgradable(deployments, "SortitionModule", {
    from: deployer,
    args: [
      deployer,
      klerosCoreAddress,
      minStakingTime,
      maxFreezingTime,
      rngWithFallback.target,
      maxStakePerJuror,
      maxTotalStaked,
    ],
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
      ZeroAddress, // jurorProsecutionModule is not implemented yet
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      ethers.toBeHex(5), // Extra data for sortition module will return the default value of K
      sortitionModule.address,
      weth.target,
      nft.target,
      ratesConverter.target,
    ],
    log: true,
  }); // nonce+2 (implementation), nonce+3 (proxy)

  // disputeKit.changeCore() only if necessary
  const disputeKitContract = await hre.ethers.getContract<DisputeKitClassic>("DisputeKitClassic");
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
    await changeCurrencyRate(core, ratesConverter, await weth.getAddress(), true, 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }

  const disputeTemplateRegistry = await getContractOrDeployUpgradable(hre, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  const resolver = await deploy("DisputeResolver", {
    from: deployer,
    args: [core.target, disputeTemplateRegistry.target],
    log: true,
  });
  console.log(`core.changeArbitrableWhitelistEnabled(true)`);
  await core.changeArbitrableWhitelistEnabled(true);
  console.log(`core.changeArbitrableWhitelist(${resolver.address}, true)`);
  await core.changeArbitrableWhitelist(resolver.address, true);

  // Extra dispute kits
  const disputeKitShutter = await deployUpgradable(deployments, "DisputeKitShutter", {
    from: deployer,
    args: [deployer, core.target, weth.target],
    log: true,
  });
  await core.addNewDisputeKit(disputeKitShutter.address);

  const disputeKitGated = await deployUpgradable(deployments, "DisputeKitGated", {
    from: deployer,
    args: [deployer, core.target, weth.target],
    log: true,
  });
  await core.addNewDisputeKit(disputeKitGated.address);

  const disputeKitGatedShutter = await deployUpgradable(deployments, "DisputeKitGatedShutter", {
    from: deployer,
    args: [deployer, core.target, weth.target], // TODO: jump to a Shutter DK instead of a Classic one?
    log: true,
  });
  await core.addNewDisputeKit(disputeKitGatedShutter.address);

  // Snapshot proxy
  await getContractOrDeploy(hre, "KlerosCoreSnapshotProxy", {
    from: deployer,
    args: [deployer, core.target],
    log: true,
  });

  await getContractOrDeploy(hre, "LeaderboardOffset", {
    from: deployer,
    args: [],
    log: true,
  });
};

deployArbitration.tags = ["ArbitrationMainnet"];
deployArbitration.dependencies = ["ChainlinkRNG"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
