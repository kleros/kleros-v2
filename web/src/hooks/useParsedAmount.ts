import { useMemo } from "react";
import { parseUnits } from "viem";

export function useParsedAmount(amount: `${number}`): bigint {
  return useMemo(() => parseUnits(amount, 18), [amount]);
}
