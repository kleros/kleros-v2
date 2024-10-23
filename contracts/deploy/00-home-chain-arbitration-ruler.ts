import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber, BigNumberish } from "ethers";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped } from "./utils";
import { deployERC20AndFaucet } from "./utils/deployTokens";
import { KlerosCore } from "../typechain-types";
import { getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const dai = await deployERC20AndFaucet(hre, deployer, "DAI");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");

  const minStake = 0;
  const alpha = 10000;
  const feeForJuror = BigNumber.from(10).pow(17);
  const jurorsForCourtJump = 16;
  const klerosCore = await deployUpgradable(deployments, "KlerosCoreRuler", {
    from: deployer,
    args: [
      deployer, // governor
      pnk.address,
      [minStake, alpha, feeForJuror, jurorsForCourtJump],
    ],
    log: true,
  });

  const changeCurrencyRate = async (
    erc20: string,
    accepted: boolean,
    rateInEth: BigNumberish,
    rateDecimals: BigNumberish
  ) => {
    const core = (await ethers.getContract("KlerosCoreRuler")) as KlerosCore;
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

  const disputeTemplateRegistry = await getContractOrDeployUpgradable(hre, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  await deploy("DisputeResolverRuler", {
    from: deployer,
    args: [klerosCore.address, disputeTemplateRegistry.address],
    log: true,
  });
};

deployArbitration.tags = ["ArbitrationRuler"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
