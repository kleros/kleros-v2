import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { FeeToken } from "../../generated/schema";
import { KlerosCore } from "../../generated/KlerosCore/KlerosCore";
import { ZERO } from "../utils";
import { RatesConverter } from "../../generated/RatesConverter/RatesConverter";

// Returns the feeToken entity from store, otherwise creates one if not present
// NOTE: The token will be not-accepted by default, this is updated by the AcceptedFeeToken handler
export function ensureFeeToken(tokenAddress: Address): FeeToken {
  const hexTokenAddress = tokenAddress.toHexString();
  let feeToken = FeeToken.load(hexTokenAddress);
  if (!feeToken) {
    feeToken = new FeeToken(hexTokenAddress);

    feeToken.rateInEth = ZERO;
    feeToken.rateDecimals = 0;
    feeToken.totalPaid = ZERO;
    feeToken.totalPaidInETH = ZERO;

    // Since this function is called by other functions too, we cannot set `accepted` to true.
    // This field will be updated by AcceptedFeeToken handler, that's the only place where we track if feeToken is accepted or not
    // For other functions using this function, it just creates FeeToken entity and updates the rate, but doesn't make the token accepted.
    feeToken.accepted = false;

    return feeToken;
  }
  return feeToken;
}

// Updates the rates for a currency by querying the RatesConverter contract on-chain.
// use `ensureFeeToken` to create the feeToken.
export function updateFeeTokenRate(feeToken: FeeToken, klerosCoreAddress: Address): FeeToken {
  const tokenAddress = Address.fromString(feeToken.id);

  const core = KlerosCore.bind(klerosCoreAddress);
  // NOTE: fetching the ratesConverter address directly from core, since this can be changed by governance.
  // Since we can't track the changes in ratesConverter actively, this acts as a fail safe, such that even if ratesConverter is changed,
  // whenever we are updating the rates in subgraph, it would be from the latest ratesConverter contract on-chain.
  const ratesConverterAddressCall = core.try_ratesConverter();

  if (ratesConverterAddressCall.reverted) {
    log.warning("Failed to query rates converter address on Kleros Core.", []);
    feeToken.save();
    return feeToken;
  }

  const ratesConverter = RatesConverter.bind(ratesConverterAddressCall.value);

  const currencyRateCall = ratesConverter.try_currencyRates(tokenAddress);
  if (currencyRateCall.reverted) {
    log.warning("Failed to query currency rate for []", [tokenAddress.toHexString()]);
    feeToken.save();
    return feeToken;
  }

  feeToken.rateInEth = currencyRateCall.value.value0;
  feeToken.rateDecimals = currencyRateCall.value.value1;

  feeToken.save();

  return feeToken;
}

// uses the latest rate on chain
export function updateFeeTokenPaid(tokenAddress: Address, klerosCoreAddress: Address, amount: BigInt): void {
  let feeToken = ensureFeeToken(tokenAddress);
  feeToken = updateFeeTokenRate(feeToken, klerosCoreAddress);

  const ethAmount = convertTokenAmountToEth(tokenAddress, amount, klerosCoreAddress);
  feeToken.totalPaid = feeToken.totalPaid.plus(amount);
  feeToken.totalPaidInETH = feeToken.totalPaidInETH.plus(ethAmount);
  feeToken.save();
}

// uses the latest rate on chain
export function convertEthToTokenAmount(tokenAddress: Address, eth: BigInt, klerosCoreAddress: Address): BigInt {
  let feeToken = ensureFeeToken(tokenAddress);
  feeToken = updateFeeTokenRate(feeToken, klerosCoreAddress);

  return eth.times(BigInt.fromI32(10 ** feeToken.rateDecimals)).div(feeToken.rateInEth);
}

// uses latest rate on chain
export function convertTokenAmountToEth(
  tokenAddress: Address,
  tokenAmount: BigInt,
  klerosCoreAddress: Address
): BigInt {
  let feeToken = ensureFeeToken(tokenAddress);
  feeToken = updateFeeTokenRate(feeToken, klerosCoreAddress);

  return tokenAmount.times(feeToken.rateInEth).div(BigInt.fromI32(10 ** feeToken.rateDecimals));
}
