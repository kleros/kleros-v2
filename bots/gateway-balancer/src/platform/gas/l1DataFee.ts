import { parseAbi, parseTransaction, serializeTransaction, type TransactionSerializable } from "viem";
import type { Address, ChainId, Hex, TxRequest } from "../../domain";
import type { FeeData } from "../executor/rpc";

/**
 * Chains that charge an L1 data fee on top of L2 gas, from the same balance and capped by nothing a transaction signs
 * (OP-stack). Base 8453 and Base Sepolia 84532 are the topology's OP-stack chains; OP Mainnet 10 and OP Sepolia
 * 11155420 are listed for the same reason. Any other id charges none here: Arbitrum folds its L1 cost into the gas
 * limit, and Arc is an L1. List an OP-stack chain here before adding it to the topology.
 */
export const OP_STACK_CHAIN_IDS: ReadonlySet<ChainId> = new Set<ChainId>([10, 8453, 84532, 11155420]);

export function chargesL1DataFee(chainId: ChainId): boolean {
  return OP_STACK_CHAIN_IDS.has(chainId);
}

/** The OP-stack GasPriceOracle predeploy. */
export const GAS_PRICE_ORACLE: Address = "0x420000000000000000000000000000000000000F";

/**
 * `getL1Fee(bytes)` exists on every OP-stack version and prices the exact bytes (viem's bundled oracle ABI is the
 * Bedrock one, without `getL1FeeUpperBound`).
 */
export const gasPriceOracleAbi = parseAbi(["function getL1Fee(bytes _data) view returns (uint256)"]);

/**
 * The oracle quote is a price at the read block, not a cap: L1 prices can rise before inclusion. The reserve counts
 * twice the quote (the headroom `executor.baseFeeMultiplier` gives the L2 base fee by default). A constant, so the
 * monitor and the executor compute the same reserve.
 */
export const L1_FEE_HEADROOM = 2n;

/** The nonce is assigned after the reserve check (decisions [L28]); no real nonce is longer. */
const NONCE_PLACEHOLDER = 0xffffffff;

/** The transaction the executor is about to sign: its request, gas limit and fees. */
export interface NextTransaction {
  request: TxRequest;
  gas: bigint;
  fees: FeeData;
}

/** The unsigned bytes of `next`, built exactly as the executor builds the transaction it signs. */
export function unsignedPayloadOf(chainId: ChainId, next: NextTransaction): Hex {
  const { request, gas, fees } = next;
  const common = {
    chainId,
    to: request.to,
    value: request.value,
    data: request.data,
    nonce: NONCE_PLACEHOLDER,
    gas,
  };
  return fees.type === "eip1559"
    ? serializeTransaction({
        ...common,
        type: "eip1559",
        maxFeePerGas: fees.maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      })
    : serializeTransaction({ ...common, type: "legacy", gasPrice: fees.gasPrice });
}

/** The unsigned bytes of a signed transaction (a legacy one comes out in its unsigned EIP-155 form). */
export function unsignedPayloadOfSigned(signedRaw: Hex): Hex {
  // The signature fields are overwritten, not left out: viem's typed serializers read them from the object itself.
  return serializeTransaction({
    ...parseTransaction(signedRaw),
    r: undefined,
    s: undefined,
    v: undefined,
    yParity: undefined,
  } as TransactionSerializable);
}
