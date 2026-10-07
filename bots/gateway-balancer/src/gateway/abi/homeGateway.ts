/**
 * PENDING CONTRACT SURFACE. The HomeGateway's funding method is not confirmed yet (specification section 10).
 * This file is the single place holding the assumed signature; swap in the final ABI here. Assumption: a
 * payable `depositNative()` credits the attached native value to the gateway's arbitration capacity. The
 * refill configuration's `depositMethod: "nativeTransfer"` sends the value with empty calldata instead, for
 * a gateway whose `receive()` is verified to accept it.
 */
export const HOME_GATEWAY_FUNDING_ABI = [
  {
    type: "function",
    name: "depositNative",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
] as const;
