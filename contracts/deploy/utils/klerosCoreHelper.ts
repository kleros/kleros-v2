import { KlerosCore, KlerosCoreRuler, KlerosCoreUniversity, RatesConverter } from "../../typechain-types";
import { BigNumberish, toBigInt } from "ethers";

export const changeCurrencyRate = async (
  core: KlerosCore | KlerosCoreRuler | KlerosCoreUniversity,
  ratesConverter: RatesConverter,
  erc20: string,
  accepted: boolean,
  rateInEth: BigNumberish,
  rateDecimals: BigNumberish
) => {
  const acceptedCurrent = await core.acceptedFeeTokens(erc20);
  if (acceptedCurrent !== accepted) {
    console.log(`core.changeAcceptedFeeTokens(${erc20}, ${accepted})`);
    const tx = await core.changeAcceptedFeeTokens(erc20, accepted);
    await tx.wait();
  }
  const rate = await ratesConverter.currencyRates(erc20);
  if (rate.rateInEth !== toBigInt(rateInEth) || rate.rateDecimals !== toBigInt(rateDecimals)) {
    console.log(`core.changeCurrencyRates(${erc20}, ${rateInEth}, ${rateDecimals})`);
    const tx = await ratesConverter.changeCurrencyRates(erc20, rateInEth, rateDecimals);
    await tx.wait();
  }
};
