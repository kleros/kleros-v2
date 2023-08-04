import { BigInt, Address } from "@graphprotocol/graph-ts";
import { FeeToken } from "../../generated/schema";
import { KlerosCore } from "../../generated/KlerosCore/KlerosCore";
import { ZERO } from "../utils";

export function ensureFeeToken(tokenAddress: Address, klerosCoreAddress: Address): FeeToken {
  const hexTokenAddress = tokenAddress.toHexString();
  let feeToken = FeeToken.load(hexTokenAddress);
  if (!feeToken) {
    feeToken = new FeeToken(hexTokenAddress);
    feeToken.totalPaid = ZERO;
    feeToken.totalPaidInETH = ZERO;
  }
  const contract = KlerosCore.bind(klerosCoreAddress);
  const currencyRate = contract.currencyRates(tokenAddress);
  feeToken.accepted = currencyRate.value0;
  feeToken.rateInEth = currencyRate.value1;
  feeToken.rateDecimals = currencyRate.value2;
  feeToken.save();
  return feeToken;
}

export function updateFeeTokenRate(tokenAddress: Address, klerosCoreAddress: Address): void {
  const feeToken = ensureFeeToken(tokenAddress, klerosCoreAddress);
  const contract = KlerosCore.bind(klerosCoreAddress);
  const currencyRate = contract.currencyRates(tokenAddress);
  feeToken.accepted = currencyRate.value0;
  feeToken.rateInEth = currencyRate.value1;
  feeToken.rateDecimals = currencyRate.value2;
  feeToken.save();
}

export function updateFeeTokenPaid(tokenAddress: Address, klerosCoreAddress: Address, amount: BigInt): void {
  const feeToken = ensureFeeToken(tokenAddress, klerosCoreAddress);
  const ethAmount = convertTokenAmountToEth(tokenAddress, amount, klerosCoreAddress);
  feeToken.totalPaid = feeToken.totalPaid.plus(amount);
  feeToken.totalPaidInETH = feeToken.totalPaidInETH.plus(ethAmount);
  feeToken.save();
}

export function convertEthToTokenAmount(tokenAddress: Address, eth: BigInt, klerosCoreAddress: Address): BigInt {
  const feeToken = ensureFeeToken(tokenAddress, klerosCoreAddress);
  return eth.times(BigInt.fromI32(10 ** feeToken.rateDecimals)).div(feeToken.rateInEth);
}

export function convertTokenAmountToEth(
  tokenAddress: Address,
  tokenAmount: BigInt,
  klerosCoreAddress: Address
): BigInt {
  const feeToken = ensureFeeToken(tokenAddress, klerosCoreAddress);
  return tokenAmount.times(feeToken.rateInEth).div(BigInt.fromI32(10 ** feeToken.rateDecimals));
}
