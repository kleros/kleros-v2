import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradableDeterministic } from "./utils/deployUpgradable";
import { changeCurrencyRate } from "./utils/klerosCoreHelper";
import { HomeChains, isSkipped, isDevnet, PNK, ETH } from "./utils";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet } from "./utils/deployTokens";
import { DisputeKitClassic, KlerosCore } from "../typechain-types";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { execute } = deployments;
  const { AddressZero } = hre.ethers.constants;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK", ethers.utils.formatBytes32String("Just use Kleros!"));
  const dai = await deployERC20AndFaucet(hre, deployer, "DAI");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");

  const randomizerOracle = await getContractOrDeploy(hre, "RandomizerOracle", {
    from: deployer,
    contract: "RandomizerMock",
    args: [],
    log: true,
    deterministicDeployment: ethers.utils.formatBytes32String("Just use Kleros!"),
  });

  await deployUpgradableDeterministic(deployments, "PolicyRegistry", { from: deployer, args: [deployer], log: true });

  await deployUpgradableDeterministic(deployments, "EvidenceModule", { from: deployer, args: [deployer], log: true });

  const rng = await deployUpgradableDeterministic(deployments, "RandomizerRNG", {
    from: deployer,
    args: [randomizerOracle.address, deployer],
    log: true,
  });

  const disputeKit = await deployUpgradableDeterministic(deployments, "DisputeKitClassic", {
    from: deployer,
    args: [deployer, AddressZero],
    log: true,
  });

  const devnet = isDevnet(hre.network);
  const minStakingTime = devnet ? 180 : 1800;
  const maxFreezingTime = devnet ? 600 : 1800;

  const sortitionModule = await deployUpgradableDeterministic(deployments, "SortitionModule", {
    from: deployer,
    args: [deployer, minStakingTime, maxFreezingTime, rng.address, RNG_LOOKAHEAD],
    log: true,
  }); // nonce (implementation), nonce+1 (proxy)

  const minStake = PNK(200);
  const alpha = 10000;
  const feeForJuror = ETH(0.1);
  const jurorsForCourtJump = 256;
  const klerosCore = await deployUpgradableDeterministic(deployments, "KlerosCore", {
    from: deployer,
    args: [
      deployer,
      deployer,
      pnk.address,
      AddressZero,
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      // ethers.utils.hexlify(5), // Extra data for sortition module will return the default value of K
      sortitionModule.address,
    ],
    log: true,
  }); // nonce+2 (implementation), nonce+3 (proxy)

  await execute("SortitionModule", { from: deployer, log: true }, "changeCore", klerosCore.address);
  await execute("KlerosCore", { from: deployer, log: true }, "creatSortitionTree", ethers.utils.hexlify(5));
  // execute DisputeKitClassic.changeCore() only if necessary
  const currentCore = await hre.ethers.getContractAt("DisputeKitClassic", disputeKit.address).then((dk) => dk.core());
  if (currentCore !== klerosCore.address) {
    const dk = (await hre.ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
    console.log(`disputeKit.changeCore(${klerosCore.address})`);
    dk.changeCore(klerosCore.address);
  }

  const core = (await hre.ethers.getContract("KlerosCore")) as KlerosCore;
  try {
    await changeCurrencyRate(core, pnk.address, true, 12225583, 12);
    await changeCurrencyRate(core, dai.address, true, 60327783, 11);
    await changeCurrencyRate(core, weth.address, true, 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }
};

deployArbitration.tags = ["Arbitration"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
