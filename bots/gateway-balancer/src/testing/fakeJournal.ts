import {
  cloneJson,
  scopeKey,
  type Operation,
  type OperationFilter,
  type OperationId,
  type OperationIntent,
  type OperationUpdate,
} from "../domain";
import {
  DuplicateTransaction,
  InsufficientClaimable,
  InsufficientHolding,
  UnknownRecord,
  type Claim,
  type Holding,
  type HoldingEntry,
  type HoldingFilter,
  type Journal,
  type Ledger,
  type NewTransactionRecord,
  type NotificationLogEntry,
  type Observation,
  type SpendEntry,
  type SpendFilter,
  type TransactionFilter,
  type TransactionRecord,
  type TransactionUpdate,
} from "../ports";

type ClaimState = "open" | "released" | "settled";

interface StoredClaim extends Claim {
  state: ClaimState;
  actualAmount: bigint | null;
}

function holdingKey(entry: Pick<HoldingEntry, "scope" | "chainId" | "asset" | "location">): string {
  return `${scopeKey(entry.scope)}|${entry.chainId}|${entry.asset.toLowerCase()}|${entry.location}`;
}

function matchesStatus<T extends string>(status: T, wanted: T | T[] | undefined): boolean {
  if (wanted === undefined) return true;
  return Array.isArray(wanted) ? wanted.includes(status) : wanted === status;
}

/** The reference in-memory implementation of the journal and ledger semantics (see `journalContract.ts`). */
export class FakeLedger implements Ledger {
  readonly claims = new Map<string, StoredClaim>();
  readonly entries: HoldingEntry[] = [];
  readonly spends: SpendEntry[] = [];
  private seq = 0;

  constructor(private readonly now: () => Date) {}

  async claim(input: {
    key: string;
    amount: bigint;
    operationId: OperationId;
    onchainAvailable: bigint;
  }): Promise<Claim> {
    if (input.amount <= 0n) throw new Error("claim: amount must be positive");
    const open = (await this.openClaims(input.key)).reduce((acc, c) => acc + c.amount, 0n);
    const available = input.onchainAvailable - open;
    if (input.amount > available) {
      throw new InsufficientClaimable(input.key, input.amount, available < 0n ? 0n : available);
    }
    const claim: StoredClaim = {
      id: `claim-${++this.seq}`,
      key: input.key,
      amount: input.amount,
      operationId: input.operationId,
      createdAt: this.now(),
      state: "open",
      actualAmount: null,
    };
    this.claims.set(claim.id, claim);
    return this.copyClaim(claim);
  }

  async releaseClaim(claimId: string): Promise<void> {
    const claim = this.claims.get(claimId);
    if (!claim) throw new UnknownRecord("claim", claimId);
    claim.state = "released";
  }

  async settleClaim(claimId: string, actualAmount: bigint): Promise<void> {
    const claim = this.claims.get(claimId);
    if (!claim) throw new UnknownRecord("claim", claimId);
    claim.state = "settled";
    claim.actualAmount = actualAmount;
  }

  async openClaims(key: string): Promise<Claim[]> {
    return [...this.claims.values()].filter((c) => c.key === key && c.state === "open").map((c) => this.copyClaim(c));
  }

  async credit(entry: HoldingEntry): Promise<void> {
    if (entry.amount <= 0n) throw new Error("credit: amount must be positive");
    this.entries.push({ ...entry, scope: { ...entry.scope } });
  }

  async debit(entry: HoldingEntry): Promise<void> {
    if (entry.amount <= 0n) throw new Error("debit: amount must be positive");
    const available = this.balance(entry);
    if (entry.amount > available) throw new InsufficientHolding(entry, available);
    this.entries.push({ ...entry, scope: { ...entry.scope }, amount: -entry.amount });
  }

  async holdings(filter: HoldingFilter = {}): Promise<Holding[]> {
    const totals = new Map<string, Holding>();
    for (const entry of this.entries) {
      if (filter.scope && scopeKey(filter.scope) !== scopeKey(entry.scope)) continue;
      if (filter.chainId !== undefined && filter.chainId !== entry.chainId) continue;
      if (filter.asset !== undefined && filter.asset.toLowerCase() !== entry.asset.toLowerCase()) continue;
      if (filter.location !== undefined && filter.location !== entry.location) continue;
      const key = holdingKey(entry);
      const current = totals.get(key);
      if (current) current.amount += entry.amount;
      else {
        totals.set(key, {
          scope: { ...entry.scope },
          chainId: entry.chainId,
          asset: entry.asset,
          location: entry.location,
          amount: entry.amount,
        });
      }
    }
    return [...totals.values()].filter((h) => h.amount !== 0n);
  }

  async recordSpend(entry: SpendEntry): Promise<void> {
    this.spends.push({ ...entry, at: new Date(entry.at.getTime()) });
  }

  async spentSince(filter: SpendFilter): Promise<bigint> {
    return this.spends
      .filter((s) => s.at.getTime() >= filter.since.getTime())
      .filter((s) => filter.chainId === undefined || s.chainId === filter.chainId)
      .filter((s) => filter.asset === undefined || s.asset.toLowerCase() === filter.asset.toLowerCase())
      .filter((s) => filter.category === undefined || s.category === filter.category)
      .reduce((acc, s) => acc + s.amount, 0n);
  }

  private balance(entry: Pick<HoldingEntry, "scope" | "chainId" | "asset" | "location">): bigint {
    const key = holdingKey(entry);
    return this.entries.filter((e) => holdingKey(e) === key).reduce((acc, e) => acc + e.amount, 0n);
  }

  private copyClaim(claim: StoredClaim): Claim {
    return {
      id: claim.id,
      key: claim.key,
      amount: claim.amount,
      operationId: claim.operationId,
      createdAt: new Date(claim.createdAt.getTime()),
    };
  }
}

export class FakeJournal implements Journal {
  readonly ledger: FakeLedger;
  readonly operations = new Map<OperationId, Operation>();
  readonly transactions = new Map<string, TransactionRecord>();
  readonly observationMap = new Map<string, Observation>();
  readonly notificationLog: NotificationLogEntry[] = [];
  readonly notificationHits = new Map<string, Date>();
  closed = false;
  private seq = 0;

  constructor(private readonly now: () => Date = () => new Date()) {
    this.ledger = new FakeLedger(now);
  }

  async createOperation(intent: OperationIntent): Promise<Operation> {
    const at = this.now();
    const operation: Operation = {
      ...intent,
      scopes: intent.scopes.map((s) => ({ ...s })),
      payload: cloneJson(intent.payload),
      id: `op-${++this.seq}`,
      status: "open",
      step: "created",
      stepPayload: null,
      attempts: 0,
      lastError: null,
      createdAt: at,
      updatedAt: at,
    };
    this.operations.set(operation.id, operation);
    return this.copyOperation(operation);
  }

  async getOperation(id: OperationId): Promise<Operation | undefined> {
    const operation = this.operations.get(id);
    return operation ? this.copyOperation(operation) : undefined;
  }

  async listOperations(filter: OperationFilter = {}): Promise<Operation[]> {
    return [...this.operations.values()]
      .filter((op) => matchesStatus(op.status, filter.status))
      .filter((op) => filter.kind === undefined || op.kind === filter.kind)
      .filter((op) => filter.pairId === undefined || op.pairId === filter.pairId)
      .filter((op) => filter.routeId === undefined || op.routeId === filter.routeId)
      .filter((op) => filter.parentId === undefined || op.parentId === filter.parentId)
      .map((op) => this.copyOperation(op));
  }

  async updateOperation(id: OperationId, update: OperationUpdate): Promise<Operation> {
    const operation = this.operations.get(id);
    if (!operation) throw new UnknownRecord("operation", id);
    if (update.step !== undefined) operation.step = update.step;
    if (update.stepPayload !== undefined) operation.stepPayload = cloneJson(update.stepPayload);
    if (update.status !== undefined) operation.status = update.status;
    if (update.lastError !== undefined) operation.lastError = update.lastError;
    if (update.incrementAttempts) operation.attempts += 1;
    operation.updatedAt = this.now();
    return this.copyOperation(operation);
  }

  async recordTransaction(record: NewTransactionRecord): Promise<TransactionRecord> {
    if (this.transactions.has(record.idempotencyKey)) throw new DuplicateTransaction(record.idempotencyKey);
    const at = this.now();
    const stored: TransactionRecord = { ...record, createdAt: at, updatedAt: at };
    this.transactions.set(record.idempotencyKey, stored);
    return { ...stored };
  }

  async updateTransaction(idempotencyKey: string, update: TransactionUpdate): Promise<TransactionRecord> {
    const stored = this.transactions.get(idempotencyKey);
    if (!stored) throw new UnknownRecord("transaction", idempotencyKey);
    Object.assign(stored, update, { updatedAt: this.now() });
    return { ...stored };
  }

  async getTransaction(idempotencyKey: string): Promise<TransactionRecord | undefined> {
    const stored = this.transactions.get(idempotencyKey);
    return stored ? { ...stored } : undefined;
  }

  async listTransactions(filter: TransactionFilter = {}): Promise<TransactionRecord[]> {
    return [...this.transactions.values()]
      .filter((tx) => filter.operationId === undefined || tx.operationId === filter.operationId)
      .filter((tx) => matchesStatus(tx.status, filter.status))
      .filter((tx) => filter.chainId === undefined || tx.chainId === filter.chainId)
      .map((tx) => ({ ...tx }));
  }

  async recordObservation(key: string, value: Observation["value"], at: Date): Promise<void> {
    this.observationMap.set(key, { key, value: cloneJson(value), at: new Date(at.getTime()) });
  }

  async observations(prefix = ""): Promise<Observation[]> {
    return [...this.observationMap.values()]
      .filter((o) => o.key.startsWith(prefix))
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((o) => ({ key: o.key, value: cloneJson(o.value), at: new Date(o.at.getTime()) }));
  }

  async shouldNotify(dedupKey: string, windowSeconds: number, now: Date): Promise<boolean> {
    const last = this.notificationHits.get(dedupKey);
    if (last && now.getTime() - last.getTime() < windowSeconds * 1000) return false;
    this.notificationHits.set(dedupKey, new Date(now.getTime()));
    return true;
  }

  async recordNotification(entry: NotificationLogEntry): Promise<void> {
    this.notificationLog.push({ ...entry, notification: { ...entry.notification }, at: new Date(entry.at.getTime()) });
  }

  async listNotifications(limit = 100): Promise<NotificationLogEntry[]> {
    return this.notificationLog
      .slice(-limit)
      .reverse()
      .map((e) => ({ ...e, notification: { ...e.notification } }));
  }

  async close(): Promise<void> {
    this.closed = true;
  }

  private copyOperation(operation: Operation): Operation {
    return {
      ...operation,
      scopes: operation.scopes.map((s) => ({ ...s })),
      payload: cloneJson(operation.payload),
      stepPayload: cloneJson(operation.stepPayload),
      createdAt: new Date(operation.createdAt.getTime()),
      updatedAt: new Date(operation.updatedAt.getTime()),
    };
  }
}
