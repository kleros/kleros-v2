import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { changeCurrencyRate } from "./utils/klerosCoreHelper";
import { HomeChains, isSkipped, isDevnet, PNK, ETH, isMainnet } from "./utils";
import { getContractOrDeploy, getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet, deployERC721 } from "./utils/deployTokens";
import { DisputeKitClassic, KlerosCoreNeo } from "../typechain-types";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const { ZeroAddress } = hre.ethers;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");
  const nft = await deployERC721(hre, deployer, "Kleros V2 Neo Early User", "KlerosV2NeoEarlyUser");

  const randomizerOracle = await getContractOrDeploy(hre, "RandomizerOracle", {
    from: deployer,
    contract: "RandomizerMock",
    args: [],
    log: true,
  });

  await deployUpgradable(deployments, "PolicyRegistry", { from: deployer, args: [deployer], log: true });

  await deployUpgradable(deployments, "EvidenceModule", { from: deployer, args: [deployer], log: true });

  const rng = await deployUpgradable(deployments, "RandomizerRNG", {
    from: deployer,
    args: [randomizerOracle.target, deployer],
    log: true,
  });

  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassicNeo", {
    from: deployer,
    contract: "DisputeKitClassic",
    args: [deployer, ZeroAddress],
    log: true,
  });

  let klerosCoreAddress = await deployments.getOrNull("KlerosCoreNeo").then((deployment) => deployment?.address);
  if (!klerosCoreAddress) {
    const nonce = await ethers.provider.getTransactionCount(deployer);
    klerosCoreAddress = getContractAddress(deployer, nonce + 3); // deployed on the 4th tx (nonce+3): SortitionModule Impl tx, SortitionModule Proxy tx, KlerosCore Impl tx, KlerosCore Proxy tx
    console.log("calculated future KlerosCoreNeo address for nonce %d: %s", nonce + 3, klerosCoreAddress);
  }
  const devnet = isDevnet(hre.network);
  const minStakingTime = devnet ? 180 : 1800;
  const maxFreezingTime = devnet ? 600 : 1800;
  const maxStakePerJuror = PNK(2_000);
  const maxTotalStaked = PNK(2_000_000);
  const sortitionModule = await deployUpgradable(deployments, "SortitionModuleNeo", {
    from: deployer,
    args: [
      deployer,
      klerosCoreAddress,
      minStakingTime,
      maxFreezingTime,
      rng.address,
      RNG_LOOKAHEAD,
      maxStakePerJuror,
      maxTotalStaked,
    ],
    log: true,
  }); // nonce (implementation), nonce+1 (proxy)

  const minStake = PNK(200);
  const alpha = 10000;
  const feeForJuror = ETH(0.1);
  const jurorsForCourtJump = 256;
  const klerosCore = await deployUpgradable(deployments, "KlerosCoreNeo", {
    from: deployer,
    args: [
      deployer,
      deployer,
      pnk.target,
      ZeroAddress,
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      ethers.toBeHex(5), // Extra data for sortition module will return the default value of K
      sortitionModule.address,
      nft.target,
    ],
    log: true,
  }); // nonce+2 (implementation), nonce+3 (proxy)

  // execute DisputeKitClassic.changeCore() only if necessary
  const disputeKitContract = (await hre.ethers.getContract("DisputeKitClassicNeo")) as DisputeKitClassic;
  const currentCore = await disputeKitContract.core();
  if (currentCore !== klerosCore.address) {
    console.log(`disputeKit.changeCore(${klerosCore.address})`);
    await disputeKitContract.changeCore(klerosCore.address);
  }

  const core = (await hre.ethers.getContract("KlerosCoreNeo")) as KlerosCoreNeo;
  try {
    await changeCurrencyRate(core, await weth.getAddress(), true, 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }

  const disputeTemplateRegistry = await getContractOrDeployUpgradable(hre, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  const resolver = await deploy("DisputeResolverNeo", {
    from: deployer,
    contract: "DisputeResolver",
    args: [core.target, disputeTemplateRegistry.target],
    log: true,
  });

  console.log(`core.changeArbitrableWhitelist(${resolver.address}, true)`);
  await core.changeArbitrableWhitelist(resolver.address, true);
};

deployArbitration.tags = ["ArbitrationNeo"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
