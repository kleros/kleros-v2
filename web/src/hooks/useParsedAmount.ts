import { useMemo } from "react";
import { parseUnits } from "viem";

export function useParsedAmount(amount: string): bigint {
  return useMemo(() => {
    if (amount === "" || isNaN(Number(amount))) {
      return BigInt(0);
    } else {
      return parseUnits(`${Number(amount)}`, 18);
    }
  }, [amount]);
}
