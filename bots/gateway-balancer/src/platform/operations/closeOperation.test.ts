import { describe, expect, it } from "vitest";
import type { Operation } from "../../domain";
import { FakeJournal } from "../../testing/fakeJournal";
import {
  CLOSE_OPERATION_USAGE,
  CORRECT_LEDGER_USAGE,
  CloseOperationRefused,
  closeOperation,
  closeOperationJson,
  correctLedger,
  parseCloseOperationArgs,
  parseCorrection,
  parseCorrectLedgerArgs,
} from "./closeOperation";

const NOW = new Date("2026-10-08T12:00:00Z");
const CHAINS = new Set([42161, 8453]);
const PAIR = { kind: "arbitration" as const, pairId: "base-arbitrum" };
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const CLAIM_KEY = "fg:base-arbitrum:arbitration:8453:native";

async function attentionOperation(journal: FakeJournal, lastError: string | null = "tx 0xabc unknown") {
  const op = await journal.createOperation({
    kind: "refill",
    description: "refill base-arbitrum",
    pairId: "base-arbitrum",
    scopes: [PAIR],
    payload: null,
  });
  return journal.updateOperation(op.id, { status: "attention", step: "withdraw", lastError });
}

async function credit(journal: FakeJournal, op: Operation, amount: bigint, asset = "native", location = "eoa") {
  await journal.ledger.credit({
    scope: PAIR,
    chainId: 8453,
    asset: asset as "native",
    location: location as "eoa",
    amount,
    operationId: op.id,
    reason: "seed",
  });
}

async function held(journal: FakeJournal, asset = "native", location: "eoa" | "in-transit" = "eoa") {
  const [holding] = await journal.ledger.holdings({ scope: PAIR, chainId: 8453, asset: asset as "native", location });
  return holding?.amount ?? 0n;
}

describe("operator command arguments", () => {
  it("parses close-operation's id, --as, corrections and --note", () => {
    expect(parseCloseOperationArgs(["op-1", "--as", "failed"])).toEqual({
      id: "op-1",
      as: "failed",
      note: "",
      corrections: [],
    });
    const args = parseCloseOperationArgs([
      "--note",
      " seen on the explorer ",
      "op-1",
      "--as",
      "completed",
      "--debit",
      `arbitration:base-arbitrum@8453:${USDC}:in-transit=25000000`,
      "--credit",
      "bridging:base->arbitrum@42161:native=1500",
    ]);
    expect(args).toMatchObject({ id: "op-1", as: "completed", note: "seen on the explorer" });
    expect(args.corrections).toEqual([
      { direction: "debit", scope: PAIR, chainId: 8453, asset: USDC, location: "in-transit", amount: 25_000_000n },
      {
        direction: "credit",
        scope: { kind: "bridging", routeId: "base->arbitrum" },
        chainId: 42161,
        asset: "native",
        location: "eoa",
        amount: 1500n,
      },
    ]);
  });

  it.each([
    ["arbitration:base-arbitrum@8453:native", /is not <scope>@<chainId>/],
    ["arbitration:base-arbitrum@8453:native=1.5", /positive integer in the asset's smallest unit/],
    ["arbitration:base-arbitrum@8453:native=0", /positive integer/],
    ["arbitration:base-arbitrum@8453:usdc=10", /"native" or a 0x token address/],
    ["arbitration:base-arbitrum@8453:native:pocket=10", /eoa or in-transit/],
    ["reporter:x@8453:native=10", /is not arbitration:<pair>, bridging:<route> or gas:<chainId>/],
    ["arbitration:@8453:native=10", /is not arbitration:<pair>/],
    ["arbitration:base-arbitrum@base:native=10", /is not <scope>@<chainId>/],
  ])("refuses the correction %s", (spec, message) => {
    expect(() => parseCorrection("debit", spec)).toThrow(message);
    expect(() => parseCloseOperationArgs(["op-1", "--as", "failed", "--debit", spec])).toThrow(CloseOperationRefused);
  });

  it.each([
    [[], /missing the operation id/],
    [["op-1"], /--as must be one of failed, completed/],
    [["op-1", "--as", "open"], /--as must be one of failed, completed/],
    [["op-1", "--as"], /--as needs a value/],
    [["op-1", "--as", "failed", "--force"], /unknown option --force/],
    [["op-1", "op-2", "--as", "failed"], /unexpected argument op-2/],
  ])("refuses close-operation %j with the usage line", (argv, message) => {
    expect(() => parseCloseOperationArgs(argv)).toThrow(message);
    expect(() => parseCloseOperationArgs(argv)).toThrow(CLOSE_OPERATION_USAGE);
  });

  it("requires a correction and a note for correct-ledger, and refuses --as", () => {
    const debit = ["--debit", "arbitration:base-arbitrum@8453:native=5"];
    expect(() => parseCorrectLedgerArgs(["op-1", "--note", "late tx"])).toThrow(/at least one --debit or --credit/);
    expect(() => parseCorrectLedgerArgs(["op-1", ...debit])).toThrow(/--note is required/);
    expect(() => parseCorrectLedgerArgs(["op-1", "--as", "failed", ...debit])).toThrow(/unknown option --as/);
    expect(() => parseCorrectLedgerArgs(["op-1", ...debit])).toThrow(CORRECT_LEDGER_USAGE);
    expect(parseCorrectLedgerArgs(["op-1", ...debit, "--note", "late tx"]).corrections).toHaveLength(1);
  });
});

describe("closeOperation", () => {
  it("closes an attention operation with the note and the previous error kept on the record", async () => {
    const journal = new FakeJournal(() => NOW);
    const op = await attentionOperation(journal);
    const args = { id: op.id, as: "failed" as const, note: "reverted, nothing moved", corrections: [] };
    const result = await closeOperation(journal, args, NOW, CHAINS);
    expect(result.operation).toMatchObject({ id: op.id, status: "failed", step: "withdraw" });
    expect(result.operation.lastError).toBe(
      "closed by the operator as failed at 2026-10-08T12:00:00.000Z: reverted, nothing moved (was: tx 0xabc unknown)"
    );
    expect((await journal.getOperation(op.id))?.status).toBe("failed");
    expect(result).toMatchObject({ corrections: [], releasedClaims: [], holdings: [], children: [], parent: null });
  });

  it("releases every open claim of the operation and only those, so the pool is claimable again", async () => {
    const journal = new FakeJournal(() => NOW);
    const op = await attentionOperation(journal);
    const mine = await journal.ledger.claim({
      key: CLAIM_KEY,
      amount: 70n,
      operationId: op.id,
      onchainAvailable: 100n,
    });
    const other = await journal.ledger.claim({
      key: CLAIM_KEY,
      amount: 30n,
      operationId: "op-other",
      onchainAvailable: 100n,
    });
    await expect(
      journal.ledger.claim({ key: CLAIM_KEY, amount: 1n, operationId: "op-next", onchainAvailable: 100n })
    ).rejects.toThrow();
    const result = await closeOperation(journal, { id: op.id, as: "failed", note: "", corrections: [] }, NOW, CHAINS);
    expect(result.releasedClaims.map((c) => c.id)).toEqual([mine.id]);
    expect((await journal.ledger.openClaims(CLAIM_KEY)).map((c) => c.id)).toEqual([other.id]);
    await journal.ledger.claim({ key: CLAIM_KEY, amount: 70n, operationId: "op-next", onchainAvailable: 100n });
  });

  it("applies debits then credits on the operation's scopes, with the note as the entries' reason", async () => {
    const journal = new FakeJournal(() => NOW);
    const op = await attentionOperation(journal);
    await credit(journal, op, 400n, USDC, "in-transit");
    // A released continuation swapped by hand: the token left in-transit, native arrived in the EOA.
    const corrections = [
      parseCorrection("credit", "arbitration:base-arbitrum@8453:native=999"),
      parseCorrection("debit", `arbitration:base-arbitrum@8453:${USDC}:in-transit=400`),
    ];
    const args = { id: op.id, as: "completed" as const, note: "swapped by hand in 0xdef", corrections };
    const result = await closeOperation(journal, args, NOW, CHAINS);
    expect(result.corrections.map((c) => c.direction)).toEqual(["debit", "credit"]);
    expect(await held(journal, USDC, "in-transit")).toBe(0n);
    expect(await held(journal)).toBe(999n);
    const reasons = journal.ledger.entries.filter((e) => e.reason !== "seed").map((e) => e.reason);
    expect(reasons).toEqual([
      "operator correction at close (completed) at 2026-10-08T12:00:00.000Z: swapped by hand in 0xdef",
      "operator correction at close (completed) at 2026-10-08T12:00:00.000Z: swapped by hand in 0xdef",
    ]);
    expect(result.holdings).toEqual([expect.objectContaining({ chainId: 8453, asset: "native", amount: 999n })]);
    const printed = JSON.parse(closeOperationJson(result)) as {
      corrections: Array<{ direction: string; scope: string; amount: string }>;
      holdings: Array<{ scope: string; amount: string }>;
    };
    expect(printed.corrections[0]).toEqual({
      direction: "debit",
      scope: "arbitration:base-arbitrum",
      chainId: 8453,
      asset: USDC,
      location: "in-transit",
      amount: "400",
    });
    expect(printed.holdings).toEqual([expect.objectContaining({ scope: "arbitration:base-arbitrum", amount: "999" })]);
  });

  it.each([
    ["a scope the operation does not have", "bridging:base->arbitrum@8453:native=1", /is not a scope of operation/],
    ["a chain outside the topology", "arbitration:base-arbitrum@1:native=1", /chain 1 is not in the topology/],
    ["a debit over the holding", "arbitration:base-arbitrum@8453:native=101", /cannot debit 101 .* it holds 100/],
  ])("refuses %s and writes nothing", async (_name, spec, message) => {
    const journal = new FakeJournal(() => NOW);
    const op = await attentionOperation(journal);
    await credit(journal, op, 100n);
    const claim = await journal.ledger.claim({ key: CLAIM_KEY, amount: 5n, operationId: op.id, onchainAvailable: 10n });
    const corrections = [
      parseCorrection("credit", "arbitration:base-arbitrum@8453:native=7"),
      parseCorrection(spec.includes("=101") || spec.includes("@1:") ? "debit" : "credit", spec),
    ];
    const entries = journal.ledger.entries.length;
    await expect(
      closeOperation(journal, { id: op.id, as: "failed", note: "", corrections }, NOW, CHAINS)
    ).rejects.toThrow(message);
    expect(journal.ledger.entries).toHaveLength(entries);
    expect((await journal.ledger.openClaimsOf(op.id)).map((c) => c.id)).toEqual([claim.id]);
    expect((await journal.getOperation(op.id))?.status).toBe("attention");
  });

  it("checks two debits of one holding together", async () => {
    const journal = new FakeJournal(() => NOW);
    const op = await attentionOperation(journal);
    await credit(journal, op, 100n);
    const corrections = [
      parseCorrection("debit", "arbitration:base-arbitrum@8453:native=60"),
      parseCorrection("debit", "arbitration:base-arbitrum@8453:native=60"),
    ];
    await expect(
      closeOperation(journal, { id: op.id, as: "failed", note: "", corrections }, NOW, CHAINS)
    ).rejects.toThrow(/cannot debit 120 .* it holds 100/);
    expect(await held(journal)).toBe(100n);
  });

  it("lists children left open and a parent still in attention", async () => {
    const journal = new FakeJournal(() => NOW);
    const parent = await attentionOperation(journal, null);
    const child = await journal.createOperation({
      kind: "transfer",
      description: "bridge",
      parentId: parent.id,
      scopes: [PAIR],
      payload: null,
    });
    await journal.updateOperation(child.id, { status: "attention" });
    const done = await journal.createOperation({
      kind: "transfer",
      description: "earlier bridge",
      parentId: parent.id,
      scopes: [PAIR],
      payload: null,
    });
    await journal.updateOperation(done.id, { status: "completed" });
    const closedChild = await closeOperation(
      journal,
      { id: child.id, as: "failed", note: "", corrections: [] },
      NOW,
      CHAINS
    );
    expect(closedChild.parent?.id).toBe(parent.id);
    const closedParent = await closeOperation(
      journal,
      { id: parent.id, as: "failed", note: "", corrections: [] },
      NOW,
      CHAINS
    );
    expect(closedParent.children).toEqual([]);
    expect(closedParent.operation.lastError).toBe("closed by the operator as failed at 2026-10-08T12:00:00.000Z");
  });

  it.each(["open", "completed", "failed"] as const)("refuses an operation that is %s", async (status) => {
    const journal = new FakeJournal(() => NOW);
    const op = await journal.createOperation({ kind: "rate-update", description: "rate", scopes: [], payload: null });
    await journal.updateOperation(op.id, { status });
    await expect(
      closeOperation(journal, { id: op.id, as: "failed", note: "", corrections: [] }, NOW, CHAINS)
    ).rejects.toThrow(new RegExp(`operation ${op.id} is ${status}, not attention`));
    expect((await journal.getOperation(op.id))?.status).toBe(status);
  });

  it("refuses an unknown operation", async () => {
    const journal = new FakeJournal(() => NOW);
    await expect(
      closeOperation(journal, { id: "op-404", as: "failed", note: "", corrections: [] }, NOW, CHAINS)
    ).rejects.toThrow(/no operation op-404 in the journal/);
  });
});

describe("correctLedger", () => {
  it("corrects a closed operation's scopes without changing its status or claims", async () => {
    const journal = new FakeJournal(() => NOW);
    const op = await attentionOperation(journal);
    await closeOperation(journal, { id: op.id, as: "failed", note: "", corrections: [] }, NOW, CHAINS);
    // The withdrawal landed after the close: the delivery is credited to the operation's scope.
    const corrections = [parseCorrection("credit", "arbitration:base-arbitrum@8453:native=250")];
    const result = await correctLedger(journal, { id: op.id, note: "0xabc landed late", corrections }, NOW, CHAINS);
    expect(result.operation.status).toBe("failed");
    expect(result.releasedClaims).toEqual([]);
    expect(await held(journal)).toBe(250n);
    expect(journal.ledger.entries.at(-1)?.reason).toBe(
      "operator correction at 2026-10-08T12:00:00.000Z: 0xabc landed late"
    );
  });

  it.each([
    ["open", /is open; correct-ledger is for a failed or completed operation$/],
    ["attention", /close it with close-operation and the same corrections/],
  ] as const)("refuses an operation that is %s", async (status, message) => {
    const journal = new FakeJournal(() => NOW);
    const op = await attentionOperation(journal);
    await journal.updateOperation(op.id, { status });
    const corrections = [parseCorrection("credit", "arbitration:base-arbitrum@8453:native=1")];
    await expect(correctLedger(journal, { id: op.id, note: "x", corrections }, NOW, CHAINS)).rejects.toThrow(message);
    expect(await held(journal)).toBe(0n);
  });
});
