import { KlerosCore, KlerosCoreNeo, KlerosCoreUniversity } from "../../typechain-types";
import { BigNumberish } from "ethers";

export const changeCurrencyRate = async (
  core: KlerosCore | KlerosCoreNeo | KlerosCoreUniversity,
  erc20: string,
  accepted: boolean,
  rateInEth: BigNumberish,
  rateDecimals: BigNumberish
) => {
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
