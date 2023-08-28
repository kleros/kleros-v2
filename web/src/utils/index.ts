import { formatEther, formatUnits } from "viem";
import { commify } from "./commify";

export const isUndefined = (maybeObject: any): maybeObject is undefined => typeof maybeObject === "undefined";

export const formatUnitsWei = (value: bigint) => formatUnits(value, 18);

export const formatPNK = (value: bigint, fractionDigits = 4) =>
  commify(Number(formatUnitsWei(value)).toFixed(fractionDigits));

export const formatETH = (value: bigint, fractionDigits = 4) =>
  commify(Number(formatEther(value)).toFixed(fractionDigits));

export const formatUSD = (value: number, fractionDigits = 2) => "$" + commify(Number(value).toFixed(fractionDigits));
