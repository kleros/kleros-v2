import { describe, expect, it } from "vitest";
import type { Operation } from "../../domain";
import { FakeJournal } from "../../testing/fakeJournal";
import {
  CLOSE_OPERATION_USAGE,
  CloseOperationRefused,
  closeOperation,
  closeOperationJson,
  parseCloseOperationArgs,
} from "./closeOperation";

const NOW = new Date("2026-10-08T12:00:00Z");

async function attentionOperation(journal: FakeJournal, lastError = "transaction 0xabc unknown"): Promise<Operation> {
  const op = await journal.createOperation({
    kind: "refill",
    description: "refill arc-arbitrum",
    pairId: "arc-arbitrum",
    scopes: [{ kind: "arbitration", pairId: "arc-arbitrum" }],
    payload: null,
  });
  return journal.updateOperation(op.id, { status: "attention", step: "deposit", lastError });
}

describe("close-operation arguments", () => {
  it("parses the id, --as and an optional --note", () => {
    expect(parseCloseOperationArgs(["op-1", "--as", "failed"])).toEqual({ id: "op-1", as: "failed", note: "" });
    expect(parseCloseOperationArgs(["--note", " seen on the explorer ", "op-1", "--as", "completed"])).toEqual({
      id: "op-1",
      as: "completed",
      note: "seen on the explorer",
    });
  });

  it.each([
    [[], /missing the operation id/],
    [["op-1"], /--as must be one of failed, completed/],
    [["op-1", "--as", "open"], /--as must be one of failed, completed/],
    [["op-1", "--as"], /--as needs a value/],
    [["op-1", "--as", "failed", "--force"], /unknown option --force/],
    [["op-1", "op-2", "--as", "failed"], /unexpected argument op-2/],
  ])("refuses %j with the usage line", (argv, message) => {
    expect(() => parseCloseOperationArgs(argv)).toThrow(CloseOperationRefused);
    expect(() => parseCloseOperationArgs(argv)).toThrow(message);
    expect(() => parseCloseOperationArgs(argv)).toThrow(CLOSE_OPERATION_USAGE);
  });
});

describe("closeOperation", () => {
  it("closes an attention operation with the note and the previous error kept on the record", async () => {
    const journal = new FakeJournal(() => NOW);
    const op = await attentionOperation(journal);
    const result = await closeOperation(journal, { id: op.id, as: "failed", note: "reverted, nothing moved" }, NOW);
    expect(result.operation).toMatchObject({ id: op.id, status: "failed", step: "deposit" });
    expect(result.operation.lastError).toBe(
      "closed by the operator as failed at 2026-10-08T12:00:00.000Z: reverted, nothing moved " +
        "(was: transaction 0xabc unknown)"
    );
    expect((await journal.getOperation(op.id))?.status).toBe("failed");
    expect(result.holdings).toEqual([]);
    expect(result.children).toEqual([]);
  });

  it("closes as completed without a note and lists the scopes' holdings and the children left open", async () => {
    const journal = new FakeJournal(() => NOW);
    const op = await attentionOperation(journal, null as unknown as string);
    await journal.ledger.credit({
      scope: { kind: "arbitration", pairId: "arc-arbitrum" },
      chainId: 42161,
      asset: "native",
      location: "eoa",
      amount: 1_500n,
      operationId: op.id,
      reason: "test",
    });
    const child = await journal.createOperation({
      kind: "transfer",
      description: "bridge",
      parentId: op.id,
      scopes: [{ kind: "arbitration", pairId: "arc-arbitrum" }],
      payload: null,
    });
    const closedChild = await journal.createOperation({
      kind: "transfer",
      description: "earlier bridge",
      parentId: op.id,
      scopes: [{ kind: "arbitration", pairId: "arc-arbitrum" }],
      payload: null,
    });
    await journal.updateOperation(closedChild.id, { status: "completed" });
    const result = await closeOperation(journal, { id: op.id, as: "completed", note: "" }, NOW);
    expect(result.operation.status).toBe("completed");
    expect(result.operation.lastError).toBe("closed by the operator as completed at 2026-10-08T12:00:00.000Z");
    expect(result.holdings).toEqual([
      expect.objectContaining({ chainId: 42161, asset: "native", location: "eoa", amount: 1_500n }),
    ]);
    expect(result.children.map((c) => c.id)).toEqual([child.id]);
    // The ledger and the children are untouched.
    expect((await journal.getOperation(child.id))?.status).toBe("open");
    expect(await journal.ledger.holdings({ scope: { kind: "arbitration", pairId: "arc-arbitrum" } })).toHaveLength(1);

    const printed = JSON.parse(closeOperationJson(result)) as {
      operation: { id: string; status: string };
      holdings: Array<{ amount: string }>;
      children: Array<{ id: string }>;
    };
    expect(printed.operation).toMatchObject({ id: op.id, status: "completed" });
    expect(printed.holdings[0]!.amount).toBe("1500");
    expect(printed.children.map((c) => c.id)).toEqual([child.id]);
  });

  it.each(["open", "completed", "failed"] as const)("refuses an operation that is %s", async (status) => {
    const journal = new FakeJournal(() => NOW);
    const op = await journal.createOperation({
      kind: "rate-update",
      description: "rate",
      scopes: [],
      payload: null,
    });
    await journal.updateOperation(op.id, { status });
    await expect(closeOperation(journal, { id: op.id, as: "failed", note: "" }, NOW)).rejects.toThrow(
      new RegExp(`operation ${op.id} is ${status}, not attention`)
    );
    expect((await journal.getOperation(op.id))?.status).toBe(status);
  });

  it("refuses an unknown operation", async () => {
    const journal = new FakeJournal(() => NOW);
    await expect(closeOperation(journal, { id: "op-404", as: "failed", note: "" }, NOW)).rejects.toThrow(
      /no operation op-404 in the journal/
    );
  });
});
