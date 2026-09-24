import { KlerosCore, KlerosCoreNeo, KlerosCoreRuler, KlerosCoreUniversity } from "../../typechain-types";
import { BigNumberish, toBigInt } from "ethers";

export const changeCurrencyRate = async (
  core: KlerosCore | KlerosCoreNeo | KlerosCoreRuler | KlerosCoreUniversity,
  erc20: string,
  accepted: boolean,
  rateInEth: BigNumberish,
  rateDecimals: BigNumberish
) => {
  const pnkRate = await core.currencyRates(erc20);
  if (pnkRate.feePaymentAccepted !== accepted) {
    console.log(`core.changeAcceptedFeeTokens(${erc20}, ${accepted})`);
    const tx = await core.changeAcceptedFeeTokens(erc20, accepted);
    await tx.wait();
  }
  if (pnkRate.rateInEth !== toBigInt(rateInEth) || pnkRate.rateDecimals !== rateDecimals) {
    console.log(`core.changeCurrencyRates(${erc20}, ${rateInEth}, ${rateDecimals})`);
    const tx = await core.changeCurrencyRates(erc20, rateInEth, rateDecimals);
    await tx.wait();
  }
};

/// Returns the ID of a dispute kit registered in the core, or undefined if not registered.
export const findDisputeKitID = async (
  core: KlerosCore | KlerosCoreNeo,
  address: string
): Promise<number | undefined> => {
  const length = await core.getDisputeKitsLength();
  for (let i = 1n; i < length; i++) {
    if ((await core.disputeKits(i)).toLowerCase() === address.toLowerCase()) return Number(i);
  }
  return undefined;
};
