import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber, BigNumberish } from "ethers";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped, isDevnet } from "./utils";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";
import { deployERC20AndFaucet } from "./utils/deployERC20AndFaucet";
import { KlerosCore } from "../typechain-types";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const { AddressZero } = hre.ethers.constants;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const dai = await deployERC20AndFaucet(hre, deployer, "DAI");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");

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
    args: [randomizerOracle.address, deployer],
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

  const minStake = BigNumber.from(10).pow(20).mul(2);
  const alpha = 10000;
  const feeForJuror = BigNumber.from(10).pow(17);
  const klerosCore = await deployUpgradable(deployments, "KlerosCore", {
    from: deployer,
    args: [
      deployer,
      pnk.address,
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

  const changeCurrencyRate = async (
    erc20: string,
    accepted: boolean,
    rateInEth: BigNumberish,
    rateDecimals: BigNumberish
  ) => {
    const core = (await ethers.getContract("KlerosCore")) as KlerosCore;
    const pnkRate = await core.currencyRates(erc20);
    if (pnkRate.feePaymentAccepted !== accepted) {
      console.log(`core.changeAcceptedFeeTokens(${erc20}, ${accepted})`);
      await core.changeAcceptedFeeTokens(erc20, accepted);
    }
    if (!pnkRate.rateInEth.eq(rateInEth) || pnkRate.rateDecimals !== rateDecimals) {
      console.log(`core.changeCurrencyRates(${erc20}, ${rateInEth}, ${rateDecimals})`);
      await core.changeCurrencyRates(erc20, rateInEth, rateDecimals);
    }
  };

  try {
    await changeCurrencyRate(pnk.address, true, 12225583, 12);
    await changeCurrencyRate(dai.address, true, 60327783, 11);
    await changeCurrencyRate(weth.address, true, 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }
};

deployArbitration.tags = ["Arbitration"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
