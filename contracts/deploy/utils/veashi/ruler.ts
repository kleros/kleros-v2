import { getAddress, ZeroAddress } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { KlerosCoreRuler } from "../../../typechain-types";
import { deployUpgradable } from "../deployUpgradable";
import { DEPLOYMENT_NAMES, lightbulbExtraData } from "./network";
import { VeashiParameters } from "./parameters";
import { assertNoProblems, rulerProblems } from "./readback";

/**
 * The HomeGateway's arbitrator (decisions [O4], [O10]): a dedicated KlerosCoreRuler proxy deployed by default (governor
 * = deployer, its General court's juror fee = `court.feeForJuror`), or an existing ruler, never redeployed.
 */
export async function deployOrReuseRuler(
  hre: HardhatRuntimeEnvironment,
  p: VeashiParameters,
  deployer: string
): Promise<KlerosCoreRuler> {
  const signer = await hre.ethers.getSigner(deployer);
  if (p.ruler.kind === "existing") {
    const address = getAddress(p.ruler.address);
    if ((await hre.ethers.provider.getCode(address)) === "0x") {
      throw new Error(`Veashi: ruler.address ${address} has no code on ${hre.network.name}`);
    }
    console.log(`Veashi: reusing the existing ruler ${address} (not redeployed; its fees are not ours)`);
    return hre.ethers.getContractAt("KlerosCoreRuler", address, signer);
  }
  const { minStake, alpha, jurorsForCourtJump } = p.ruler;
  const ruler = await deployUpgradable(hre.deployments, DEPLOYMENT_NAMES.ruler, {
    contract: "KlerosCoreRuler",
    proxyAlias: "KlerosCoreRulerProxy",
    from: deployer,
    args: [
      deployer, // governor
      ZeroAddress, // pinakion: the mock arbitrator never touches PNK
      [minStake, alpha, p.court.feeForJuror, jurorsForCourtJump],
    ],
    log: true,
  });
  return hre.ethers.getContractAt("KlerosCoreRuler", ruler.address, signer);
}

/**
 * The ruler's `arbitrationCost(extraData)` for the Lightbulb's extraData must equal the juror fees the ForeignGateway
 * charges for it (`court.feeForJuror x court.minJurors`, home native = foreign native): that is what the HomeGateway
 * pays per case, and the bot's `referenceCaseCostEth`. Checked before the HomeGateway is deployed.
 */
export async function assertCaseCost(ruler: KlerosCoreRuler, p: VeashiParameters): Promise<bigint> {
  const cost = await ruler["arbitrationCost(bytes)"](lightbulbExtraData(p));
  const expected = (p.court.feeForJuror * p.court.minJurors * p.homeNativeRate) / 10n ** 18n;
  if (cost !== expected) {
    throw new Error(
      `Veashi: arbitration cost mismatch: the ruler ${await ruler.getAddress()} charges ${cost} wei for the ` +
        `Lightbulb's extraData (court ${p.court.id}, ${p.court.minJurors} jurors), the ForeignGateway parameters ` +
        `${expected} wei (court.feeForJuror x court.minJurors). Align court.feeForJuror with the ruler.`
    );
  }
  return cost;
}

/**
 * `changeRulingModeToManual(homeGateway)` from the deployer, which makes it the HomeGateway's ruler. The first caller
 * of that function becomes the ruler, so it must happen in the run that deploys the HomeGateway; a ruler that already
 * names someone else fails here, loudly, instead of leaving disputes to revert `RulingModeNotSet` or be ruled by them.
 */
export async function setManualRuling(ruler: KlerosCoreRuler, homeGateway: string, deployer: string): Promise<void> {
  const current = await ruler.rulers(homeGateway);
  if (current !== ZeroAddress && getAddress(current) !== getAddress(deployer)) {
    throw new Error(
      `Veashi: the ruler ${await ruler.getAddress()} already names ${current} as the ruler of the HomeGateway ` +
        `${homeGateway}; the deployer ${deployer} is not accepted. Do not use this HomeGateway.`
    );
  }
  try {
    await (await ruler.changeRulingModeToManual(homeGateway)).wait();
  } catch (error) {
    throw new Error(
      `Veashi: changeRulingModeToManual(${homeGateway}) from ${deployer} failed: ${(error as Error).message}`
    );
  }
  assertNoProblems("KlerosCoreRuler", await rulerProblems(ruler, homeGateway, deployer));
}
