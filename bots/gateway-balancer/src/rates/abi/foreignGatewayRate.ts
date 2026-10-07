import type { RateRejection } from "../../ports";

/**
 * PENDING: the ForeignGateway currency-rate surface is not final. Every assumed signature lives in this file;
 * swap in the final ABI by editing it alone.
 *
 * Assumed:
 * - `function currencyRate() view returns (uint256 rate, uint64 updatedAt)`: units of the pair's currency per
 *   1 ETH at `RATE_DECIMALS` decimals; `updatedAt` in unix seconds, 0 before the first update.
 * - `function updateCurrencyRate(uint256 newRate)`: restricted to the balancer EOA's role; the contract enforces
 *   the cooldown, the maximum change and the bounds and reverts with the errors below.
 * - `error RateUpdateCooldown(uint256 nextUpdateAt)`, `error RateChangeTooLarge(uint256 currentRate, uint256
 *   newRate)`, `error RateOutOfBounds(uint256 newRate, uint256 minRate, uint256 maxRate)`, `error
 *   RateUpdaterUnauthorized(address caller)`.
 */
export const RATE_DECIMALS = 18;

export const foreignGatewayRateAbi = [
  {
    type: "function",
    name: "currencyRate",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "rate", type: "uint256" },
      { name: "updatedAt", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "updateCurrencyRate",
    stateMutability: "nonpayable",
    inputs: [{ name: "newRate", type: "uint256" }],
    outputs: [],
  },
  {
    type: "error",
    name: "RateUpdateCooldown",
    inputs: [{ name: "nextUpdateAt", type: "uint256" }],
  },
  {
    type: "error",
    name: "RateChangeTooLarge",
    inputs: [
      { name: "currentRate", type: "uint256" },
      { name: "newRate", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "RateOutOfBounds",
    inputs: [
      { name: "newRate", type: "uint256" },
      { name: "minRate", type: "uint256" },
      { name: "maxRate", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "RateUpdaterUnauthorized",
    inputs: [{ name: "caller", type: "address" }],
  },
] as const;

/** The contract guardrail each custom error of the fragment stands for. */
export const RATE_ERROR_REJECTIONS: Readonly<Record<string, Exclude<RateRejection, "unknown">>> = {
  RateUpdateCooldown: "cooldown",
  RateChangeTooLarge: "max-change",
  RateOutOfBounds: "out-of-bounds",
  RateUpdaterUnauthorized: "unauthorized",
};
