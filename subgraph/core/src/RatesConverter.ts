import { NewCurrencyRate } from "../generated/RatesConverter/RatesConverter";
import { ensureFeeToken } from "./entities/FeeToken";

// NOTE: in case the rates converter is ever changed by governance (unlikely),
// the rates for tokens will still keep updating since subgraph calls the latest ratesConverter onchain via `./entities/FeeToken/updateFeeTokenRate`.
// If that ever happens, this contract would just become old and we would stop getting NewCurrencyRate events,
// in that scenario, we should just re-deploy the subgraph with latest RatesConvertor (grafted on top of old one).
export function handleNewCurrencyRate(event: NewCurrencyRate): void {
  const feeToken = ensureFeeToken(event.params._feeToken);
  feeToken.rateInEth = event.params._rateInEth;
  feeToken.rateDecimals = event.params._rateDecimals;

  feeToken.save();
}
