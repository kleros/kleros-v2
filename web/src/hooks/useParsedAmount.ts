import { BigNumber, utils } from "ethers";
import { useMemo } from "react";

export function useParsedAmount(amount: string): BigNumber {
  return useMemo(() => (amount === "" ? BigNumber.from(0) : utils.parseUnits(amount, 18)), [amount]);
}
