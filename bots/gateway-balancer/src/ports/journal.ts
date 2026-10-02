import type {
  AccountingScope,
  Address,
  AssetAddress,
  ChainId,
  Hex,
  JsonValue,
  Notification,
  Operation,
  OperationFilter,
  OperationId,
  OperationIntent,
  OperationUpdate,
} from "../domain";

/**
 * The journal is the bot's only durable state (SQLite on a volume). Rules every implementation keeps:
 * - an operation's intent is recorded before any external side effect;
 * - a transaction record exists (with its signed bytes and hash) before the transaction is broadcast;
 * - returned objects are copies; mutating them never changes the store;
 * - nothing secret is ever stored (no keys, no credentials, no webhook URLs).
 */

export type TxStatus =
  | "prepared"
  | "signed"
  | "broadcast"
  | "confirmed"
  | "reverted"
  | "replaced"
  | "failed"
  | "unknown";

export interface TransactionRecord {
  /** Unique per logical send: `op:<operationId>:step:<step>`; a second `submit` with the same key never re-sends. */
  idempotencyKey: string;
  operationId: OperationId;
  chainId: ChainId;
  from: Address;
  to: Address;
  value: bigint;
  data: Hex | null;
  nonce: number | null;
  hash: Hex | null;
  /** The signed raw transaction, so a crash between signing and broadcast can be recovered by rebroadcasting. */
  signedRaw: Hex | null;
  status: TxStatus;
  error: string | null;
  replacedByHash: Hex | null;
  blockNumber: bigint | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NewTransactionRecord = Omit<TransactionRecord, "createdAt" | "updatedAt">;
export type TransactionUpdate = Partial<
  Pick<TransactionRecord, "nonce" | "hash" | "signedRaw" | "status" | "error" | "replacedByHash" | "blockNumber">
>;

export interface TransactionFilter {
  operationId?: OperationId;
  status?: TxStatus | TxStatus[];
  chainId?: ChainId;
}

/** A reservation against an on-chain balance several loops may draw from (see domain/accounting claim keys). */
export interface Claim {
  id: string;
  key: string;
  amount: bigint;
  operationId: OperationId;
  createdAt: Date;
}

export type HoldingLocation = "eoa" | "in-transit";

export interface HoldingEntry {
  scope: AccountingScope;
  chainId: ChainId;
  asset: AssetAddress;
  location: HoldingLocation;
  amount: bigint;
  operationId: OperationId;
  reason: string;
}

export interface Holding {
  scope: AccountingScope;
  chainId: ChainId;
  asset: AssetAddress;
  location: HoldingLocation;
  amount: bigint;
}

export interface HoldingFilter {
  scope?: AccountingScope;
  chainId?: ChainId;
  asset?: AssetAddress;
  location?: HoldingLocation;
}

export type SpendCategory = "bridge-fee" | "slippage" | "gas" | "deposit" | "reporter" | "transfer";

export interface SpendEntry {
  chainId: ChainId;
  asset: AssetAddress;
  category: SpendCategory;
  amount: bigint;
  operationId: OperationId;
  at: Date;
}

export interface SpendFilter {
  since: Date;
  chainId?: ChainId;
  asset?: AssetAddress;
  category?: SpendCategory;
}

export interface Observation {
  key: string;
  value: JsonValue;
  at: Date;
}

export interface NotificationLogEntry {
  notification: Notification;
  at: Date;
  delivered: boolean;
  providers: string[];
  /** Why it was not delivered (deduplicated, filtered, every provider disabled, provider error). */
  suppressed: string | null;
}

export class InsufficientClaimable extends Error {
  constructor(
    public readonly key: string,
    public readonly requested: bigint,
    public readonly available: bigint
  ) {
    super(`insufficient claimable on ${key}: requested ${requested}, available ${available}`);
    this.name = "InsufficientClaimable";
  }
}

export class InsufficientHolding extends Error {
  constructor(
    public readonly entry: HoldingEntry,
    public readonly available: bigint
  ) {
    super(
      `insufficient holding for ${JSON.stringify({ ...entry, amount: entry.amount.toString() })}: ` +
        `available ${available}`
    );
    this.name = "InsufficientHolding";
  }
}

export class DuplicateTransaction extends Error {
  constructor(public readonly idempotencyKey: string) {
    super(`transaction already recorded: ${idempotencyKey}`);
    this.name = "DuplicateTransaction";
  }
}

export class UnknownRecord extends Error {
  constructor(what: string, id: string) {
    super(`unknown ${what}: ${id}`);
    this.name = "UnknownRecord";
  }
}

/**
 * Allocation ledger. Claims reserve on-chain balances before a withdrawal; holdings track what the EOA holds
 * per accounting scope after it. Loops spend only holdings of their own scope: the ledger refuses the rest.
 */
export interface Ledger {
  /**
   * Atomic: succeeds only when `amount <= onchainAvailable - sum(open claims on key)`, else throws
   * `InsufficientClaimable`. `onchainAvailable` is the balance the caller just read.
   */
  claim(input: { key: string; amount: bigint; operationId: OperationId; onchainAvailable: bigint }): Promise<Claim>;
  /** The claim was not used (operation abandoned before the withdrawal). */
  releaseClaim(claimId: string): Promise<void>;
  /** The withdrawal confirmed; the claim is closed with the amount actually taken. */
  settleClaim(claimId: string, actualAmount: bigint): Promise<void>;
  openClaims(key: string): Promise<Claim[]>;

  credit(entry: HoldingEntry): Promise<void>;
  /** Throws `InsufficientHolding` when the scope/chain/asset/location holds less than `amount`. */
  debit(entry: HoldingEntry): Promise<void>;
  /** Aggregated per scope, chain, asset and location; zero balances omitted. */
  holdings(filter?: HoldingFilter): Promise<Holding[]>;

  recordSpend(entry: SpendEntry): Promise<void>;
  spentSince(filter: SpendFilter): Promise<bigint>;
}

export interface Journal {
  createOperation(intent: OperationIntent): Promise<Operation>;
  getOperation(id: OperationId): Promise<Operation | undefined>;
  listOperations(filter?: OperationFilter): Promise<Operation[]>;
  /** Throws `UnknownRecord` for an unknown id. */
  updateOperation(id: OperationId, update: OperationUpdate): Promise<Operation>;

  /** Throws `DuplicateTransaction` when the idempotency key exists. */
  recordTransaction(record: NewTransactionRecord): Promise<TransactionRecord>;
  updateTransaction(idempotencyKey: string, update: TransactionUpdate): Promise<TransactionRecord>;
  getTransaction(idempotencyKey: string): Promise<TransactionRecord | undefined>;
  listTransactions(filter?: TransactionFilter): Promise<TransactionRecord[]>;

  readonly ledger: Ledger;

  /** Latest value per key (health and status read these: capacities, gas reserves, stale prices, suspensions). */
  recordObservation(key: string, value: JsonValue, at: Date): Promise<void>;
  observations(prefix?: string): Promise<Observation[]>;

  /** True once per `windowSeconds` for a key, and records the hit. */
  shouldNotify(dedupKey: string, windowSeconds: number, now: Date): Promise<boolean>;
  recordNotification(entry: NotificationLogEntry): Promise<void>;
  listNotifications(limit?: number): Promise<NotificationLogEntry[]>;

  close(): Promise<void>;
}
