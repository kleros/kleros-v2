import { parseTransaction } from "viem";
import { NATIVE, type Address, type ChainId, type Hex } from "../../domain";
import type { Journal, TransactionRecord, TxStatus } from "../../ports";
import {
  chargesL1DataFee,
  L1_FEE_HEADROOM,
  unsignedPayloadOf,
  unsignedPayloadOfSigned,
  type NextTransaction,
} from "./l1DataFee";

/** Chain reads pinned to one block, so the balance and the transaction count describe the same state. */
export interface ReserveRpc {
  getBlockNumber(): Promise<bigint>;
  getBalance(address: Address, blockNumber: bigint): Promise<bigint>;
  getNonce(address: Address, block: bigint): Promise<number>;
  /**
   * The OP-stack GasPriceOracle's `getL1Fee` of unsigned transaction bytes at `blockNumber`. Required on an OP-stack
   * chain (`chargesL1DataFee`) whenever a read there has something to price.
   */
  getL1Fee?(unsignedTx: Hex, blockNumber: bigint): Promise<bigint>;
}

export interface GasReserve {
  blockNumber: bigint;
  balanceWei: bigint;
  /** The EOA's transaction count at `blockNumber`: records with a nonce at or above it are not in the balance yet. */
  transactionCount: number;
  /** Native `eoa` holdings the ledger assigns to scopes on this chain. */
  ledgerHeldWei: bigint;
  /**
   * `value + gas * maxFeePerGas` (or `gasPrice`) of this chain's unmined nonce-holding records, plus, on an OP-stack
   * chain, their L1 data fee (`L1_FEE_HEADROOM` x the oracle quote).
   */
  inFlightWei: bigint;
  inFlight: string[];
  /** `balanceWei - ledgerHeldWei - inFlightWei`: what is left for transaction gas. */
  reserveWei: bigint;
  /**
   * The L1 data fee of `next` on an OP-stack chain (`L1_FEE_HEADROOM` x the oracle quote), else 0. Not in
   * `reserveWei`: the executor adds it to what the reserve must cover.
   */
  nextL1FeeWei: bigint;
}

const NONCE_HOLDING: TxStatus[] = ["signed", "broadcast", "unknown"];

/** The most a signed record can still take from the balance: its value plus its gas limit at its fee cap. */
export function maxCostOf(record: TransactionRecord): bigint {
  if (record.signedRaw === null) {
    // A nonce without signed bytes should not exist; never size it as zero gas.
    throw new Error(`record ${record.idempotencyKey} holds nonce ${record.nonce} without signed bytes`);
  }
  const tx = parseTransaction(record.signedRaw);
  const fee = tx.maxFeePerGas ?? tx.gasPrice;
  if (tx.gas === undefined || fee === undefined) {
    throw new Error(`record ${record.idempotencyKey} has no gas limit or fee in its signed bytes`);
  }
  return (tx.value ?? 0n) + tx.gas * fee;
}

/**
 * The operator gas reserve of one chain (decisions [L26], [L28]): the native balance and the transaction count read
 * at the same block, minus the native `eoa` holdings of the ledger, minus the maximum cost of this chain's
 * nonce-holding records whose nonce is not yet in that block (a mined record is already in the balance). The
 * executor's pre-signing check and the `gas:<chainId>` monitor both use this.
 *
 * On an OP-stack chain every transaction also pays an L1 data fee from the same balance: each unmined record's fee
 * (from its unsigned bytes) is part of `inFlightWei`, and the fee of `next` (the transaction about to be signed) is
 * returned as `nextL1FeeWei`, both priced by the GasPriceOracle at the same block. An L1 data fee that cannot be read
 * fails the read; it is never taken as zero. Nothing to price means no oracle call.
 */
export async function readGasReserve(input: {
  rpc: ReserveRpc;
  journal: Journal;
  chainId: ChainId;
  signer: Address;
  next?: NextTransaction;
}): Promise<GasReserve> {
  const { rpc, journal, chainId, signer, next } = input;
  const blockNumber = await rpc.getBlockNumber();
  const [balanceWei, transactionCount] = await Promise.all([
    rpc.getBalance(signer, blockNumber),
    rpc.getNonce(signer, blockNumber),
  ]);
  const ledgerHeldWei = (await journal.ledger.holdings({ chainId, asset: NATIVE, location: "eoa" })).reduce(
    (acc, h) => acc + h.amount,
    0n
  );
  const unmined = (await journal.listTransactions({ chainId, status: NONCE_HOLDING })).filter(
    (r) => r.from.toLowerCase() === signer.toLowerCase() && r.nonce !== null && r.nonce >= transactionCount
  );
  // L2 cost first: a record without signed bytes throws before any oracle read.
  let inFlightWei = unmined.reduce((acc, r) => acc + maxCostOf(r), 0n);
  let nextL1FeeWei = 0n;
  if (chargesL1DataFee(chainId)) {
    const fees = await Promise.all(
      unmined.map((r) => readL1Fee(rpc, chainId, unsignedPayloadOfSigned(r.signedRaw as Hex), blockNumber))
    );
    inFlightWei += fees.reduce((acc, fee) => acc + fee, 0n);
    if (next) nextL1FeeWei = await readL1Fee(rpc, chainId, unsignedPayloadOf(chainId, next), blockNumber);
  }
  return {
    blockNumber,
    balanceWei,
    transactionCount,
    ledgerHeldWei,
    inFlightWei,
    inFlight: unmined.map((r) => r.idempotencyKey),
    reserveWei: balanceWei - ledgerHeldWei - inFlightWei,
    nextL1FeeWei,
  };
}

async function readL1Fee(rpc: ReserveRpc, chainId: ChainId, payload: Hex, blockNumber: bigint): Promise<bigint> {
  if (!rpc.getL1Fee) {
    throw new Error(`chain ${chainId} charges an L1 data fee and its RPC cannot read GasPriceOracle.getL1Fee`);
  }
  return (await rpc.getL1Fee(payload, blockNumber)) * L1_FEE_HEADROOM;
}
