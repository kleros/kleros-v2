import { parseTransaction } from "viem";
import { NATIVE, type Address, type ChainId } from "../../domain";
import type { Journal, TransactionRecord, TxStatus } from "../../ports";

/** Chain reads pinned to one block, so the balance and the transaction count describe the same state. */
export interface ReserveRpc {
  getBlockNumber(): Promise<bigint>;
  getBalance(address: Address, blockNumber: bigint): Promise<bigint>;
  getNonce(address: Address, block: bigint): Promise<number>;
}

export interface GasReserve {
  blockNumber: bigint;
  balanceWei: bigint;
  /** The EOA's transaction count at `blockNumber`: records with a nonce at or above it are not in the balance yet. */
  transactionCount: number;
  /** Native `eoa` holdings the ledger assigns to scopes on this chain. */
  ledgerHeldWei: bigint;
  /** `value + gas * maxFeePerGas` (or `gasPrice`) of this chain's unmined nonce-holding records. */
  inFlightWei: bigint;
  inFlight: string[];
  /** `balanceWei - ledgerHeldWei - inFlightWei`: what is left for transaction gas. */
  reserveWei: bigint;
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
 */
export async function readGasReserve(input: {
  rpc: ReserveRpc;
  journal: Journal;
  chainId: ChainId;
  signer: Address;
}): Promise<GasReserve> {
  const { rpc, journal, chainId, signer } = input;
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
  const inFlightWei = unmined.reduce((acc, r) => acc + maxCostOf(r), 0n);
  return {
    blockNumber,
    balanceWei,
    transactionCount,
    ledgerHeldWei,
    inFlightWei,
    inFlight: unmined.map((r) => r.idempotencyKey),
    reserveWei: balanceWei - ledgerHeldWei - inFlightWei,
  };
}
