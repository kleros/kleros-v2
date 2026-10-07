/**
 * PENDING CONTRACT SURFACE. The ForeignGateway's per-category balance view and the balancer's privileged
 * withdrawal are not implemented yet (specification section 10). This file is the single place holding the
 * assumed signatures; swap in the final ABI here once the contract is deployed. Assumptions:
 * - `feeBalances(token)` returns the total, arbitration and bridging balances of one collected asset in the
 *   asset's smallest unit; `token` is the ERC20 address, or the zero address for the chain's native asset.
 * - `withdrawFees(category, token, amount, recipient)` is callable only by the balancer; `category` is
 *   `FEE_CATEGORY[category]`.
 */
export const FOREIGN_GATEWAY_TREASURY_ABI = [
  {
    type: "function",
    name: "feeBalances",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      { name: "total", type: "uint256" },
      { name: "arbitrationFees", type: "uint256" },
      { name: "bridgingFees", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "withdrawFees",
    stateMutability: "nonpayable",
    inputs: [
      { name: "category", type: "uint8" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [],
  },
] as const;

/** PENDING: the assumed on-chain encoding of the fee categories. */
export const FEE_CATEGORY = { arbitration: 0, bridging: 1 } as const;

/** PENDING: the token argument that designates the chain's native asset. */
export const NATIVE_TOKEN_ARGUMENT = "0x0000000000000000000000000000000000000000" as const;
