import { useMemo } from "react";
import { parseUnits } from "viem";

export function useParsedAmount(amount: string): bigint {
  return useMemo(() => (amount === "" ? 0n : parseUnits(`${parseInt(amount)}`, 18)), [amount]);
}
