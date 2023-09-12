import { formatEther, formatUnits } from "viem";
import { commify } from "./commify";

export const roundNumberDown = (value: number, fractionDigits = 0) => {
  const factor = 10 ** fractionDigits;
  return Math.floor(value * factor) / factor;
};

export const formatUnitsWei = (value: bigint) => formatUnits(value, 18);

export const formatValue = (value: string, fractionDigits, roundDown) => {
  let units = Number(value);
  if (roundDown) units = roundNumberDown(units, fractionDigits);
  return commify(units.toFixed(fractionDigits));
};

export const formatPNK = (value: bigint, fractionDigits = 0, roundDown = false) =>
  formatValue(formatUnitsWei(value), fractionDigits, roundDown);

export const formatETH = (value: bigint, fractionDigits = 4, roundDown = false) =>
  formatValue(formatEther(value), fractionDigits, roundDown);

export const formatUSD = (value: number, fractionDigits = 2) => "$" + commify(Number(value).toFixed(fractionDigits));
