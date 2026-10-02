import { keccak256, stringToHex } from "viem";
import type { Address, Hex, TxRequest } from "../domain";
import type { Journal, RecoveryReport, SubmitOptions, SubmitOutcome, TxExecutor, TxStatus } from "../ports";

export const FAKE_SIGNER: Address = "0x1000000000000000000000000000000000000001";

export function fakeHash(seed: string): Hex {
  return keccak256(stringToHex(seed));
}

export interface RecordedSubmission {
  request: TxRequest;
  options: SubmitOptions;
  outcome: SubmitOutcome;
}

type OutcomeScript = SubmitOutcome | ((request: TxRequest, options: SubmitOptions) => SubmitOutcome);

function statusOf(outcome: SubmitOutcome): TxStatus {
  switch (outcome.status) {
    case "confirmed":
      return "confirmed";
    case "reverted":
      return "reverted";
    case "pending":
      return "broadcast";
    case "replaced":
      return "replaced";
    case "failed":
      return "failed";
    case "unknown":
      return "unknown";
  }
}

/**
 * Records every submission and answers with scripted outcomes (default: confirmed). Idempotent like the real
 * executor: a repeated idempotency key returns the recorded outcome without a new submission. When given a
 * journal, it mirrors each submission as a transaction record, as the real executor does.
 */
export class FakeExecutor implements TxExecutor {
  readonly submissions: RecordedSubmission[] = [];
  private readonly outcomes = new Map<string, SubmitOutcome>();
  private readonly scripts: Array<{
    match: (request: TxRequest, options: SubmitOptions) => boolean;
    outcome: OutcomeScript;
  }> = [];
  private block = 100n;

  constructor(
    readonly signer: Address = FAKE_SIGNER,
    private readonly journal?: Journal
  ) {}

  /** The first matching script answers a submission; later scripts are checked in order. */
  script(match: (request: TxRequest, options: SubmitOptions) => boolean, outcome: OutcomeScript): this {
    this.scripts.push({ match, outcome });
    return this;
  }

  /** Overwrites a recorded outcome (e.g. pending -> confirmed) for the next `resolve` or `submit`. */
  settle(idempotencyKey: string, outcome: SubmitOutcome): void {
    this.outcomes.set(idempotencyKey, outcome);
  }

  async submit(request: TxRequest, options: SubmitOptions): Promise<SubmitOutcome> {
    const existing = this.outcomes.get(options.idempotencyKey);
    if (existing) return existing;
    const script = this.scripts.find((s) => s.match(request, options));
    const outcome: SubmitOutcome = script
      ? typeof script.outcome === "function"
        ? script.outcome(request, options)
        : script.outcome
      : { status: "confirmed", hash: fakeHash(options.idempotencyKey), blockNumber: ++this.block, gasUsed: 21_000n };
    this.outcomes.set(options.idempotencyKey, outcome);
    this.submissions.push({ request: { ...request }, options: { ...options }, outcome });
    if (this.journal) {
      const hash = "hash" in outcome ? outcome.hash : null;
      await this.journal.recordTransaction({
        idempotencyKey: options.idempotencyKey,
        operationId: options.operationId,
        chainId: request.chainId,
        from: this.signer,
        to: request.to,
        value: request.value,
        data: request.data ?? null,
        nonce: this.submissions.length - 1,
        hash,
        signedRaw: null,
        status: statusOf(outcome),
        error: outcome.status === "failed" ? outcome.error : null,
        replacedByHash: outcome.status === "replaced" ? outcome.replacedByHash : null,
        blockNumber: outcome.status === "confirmed" ? outcome.blockNumber : null,
      });
    }
    return outcome;
  }

  async resolve(idempotencyKey: string): Promise<SubmitOutcome | undefined> {
    return this.outcomes.get(idempotencyKey);
  }

  async recover(): Promise<RecoveryReport> {
    return { resolved: 0, rebroadcast: 0, unknown: [] };
  }
}
