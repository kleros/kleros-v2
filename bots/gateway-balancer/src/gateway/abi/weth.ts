/** WETH9 `withdraw(uint256)` (stable, not pending): unwraps wrapped native into native for the caller. */
export const WRAPPED_NATIVE_ABI = [
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "wad", type: "uint256" }],
    outputs: [],
  },
] as const;
