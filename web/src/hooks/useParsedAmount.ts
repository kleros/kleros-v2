import { useMemo } from "react";
import { BigNumber, utils } from "ethers";

export function useParsedAmount(amount: string) {
  return useMemo(
    () => (amount === "" ? BigNumber.from(0) : utils.parseUnits(amount, 18)),
    [amount]
  );
}
