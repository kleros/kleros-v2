import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import type { NewTransactionRecord, RecoveryReport, TxStatus } from "../../ports";
import { FakeExecutor } from "../../testing/fakeExecutor";
import { makeFakePorts, type FakePorts } from "../../testing/ports";
import { FakeClock } from "../../testing/fakeClock";
import { PlatformExecutor } from "../executor/executor";
import { RpcFailure, type ExecutorRpc } from "../executor/rpc";
import { ANVIL_ACCOUNTS } from "../testkit/anvil";
import { reconcile } from "./reconcile";

function record(operationId: string, step: string, status: TxStatus): NewTransactionRecord {
  return {
    idempotencyKey: `op:${operationId}:step:${step}`,
    operationId,
    chainId: 1003,
    from: "0x1000000000000000000000000000000000000001",
    to: "0x00000000000000000000000000000000000000b1",
    value: 1n,
    data: null,
    nonce: status === "failed" ? null : 3,
    hash: status === "failed" ? null : "0x01",
    signedRaw: status === "failed" ? null : "0x02",
    status,
    error: status === "failed" ? "simulation reverted revertData=none" : null,
    replacedByHash: null,
    blockNumber: status === "confirmed" ? 10n : null,
  };
}

/** A FakeExecutor whose `recover` is observable and leaves the journal as it is. */
class RecoveringExecutor extends FakeExecutor {
  recovered = 0;
  constructor(private readonly report: RecoveryReport) {
    super();
  }
  override async recover(): Promise<RecoveryReport> {
    this.recovered += 1;
    return this.report;
  }
}

async function seed(ports: FakePorts) {
  const ops: Record<string, string> = {};
  for (const [name, statuses] of Object.entries({
    confirmed: ["confirmed"],
    failed: ["failed"],
    pending: ["confirmed", "broadcast"],
    unknown: ["confirmed", "unknown"],
    replaced: ["replaced"],
    none: [],
  } as Record<string, TxStatus[]>)) {
    const op = await ports.journal.createOperation({
      kind: "refill",
      description: `refill ${name}`,
      scopes: [{ kind: "arbitration", pairId: "usdc-home" }],
      pairId: "usdc-home",
      payload: { amount: 5n },
    });
    await ports.journal.updateOperation(op.id, { step: `step-${name}`, stepPayload: { marker: name } });
    for (const [i, status] of statuses.entries()) await ports.journal.recordTransaction(record(op.id, `s${i}`, status));
    ops[name] = op.id;
  }
  return ops;
}

describe("reconcile", () => {
  it("leaves resumable operations open and untouched; only unknown or replaced go to attention", async () => {
    const ports = makeFakePorts();
    const ops = await seed(ports);
    const executor = new RecoveringExecutor({ resolved: 2, rebroadcast: 1, unknown: ["x"] });
    const before = new Map(
      await Promise.all(Object.values(ops).map(async (id) => [id, await ports.journal.getOperation(id)] as const))
    );

    const report = await reconcile({
      journal: ports.journal,
      executor,
      notifier: ports.notifier,
      logger: ports.logger,
    });

    expect(executor.recovered).toBe(1);
    expect(report.attention.sort()).toEqual([ops.unknown, ops.replaced].sort());
    expect(report.resumable.sort()).toEqual([ops.confirmed, ops.failed, ops.pending, ops.none].sort());
    for (const name of ["confirmed", "failed", "pending", "none"]) {
      // Resumable means left exactly as it was: reconciliation never writes step or stepPayload.
      expect(await ports.journal.getOperation(ops[name]!)).toEqual(before.get(ops[name]!));
    }
    for (const name of ["unknown", "replaced"]) {
      const op = await ports.journal.getOperation(ops[name]!);
      expect(op?.status).toBe("attention");
      expect(op?.step).toBe(`step-${name}`);
      expect(op?.stepPayload).toEqual({ marker: name });
      expect(op?.lastError).toContain(name === "unknown" ? "is unknown" : "is replaced");
    }
    expect(ports.notifier.sent.map((n) => [n.operationId, n.severity, n.dedupKey])).toEqual([
      [ops.unknown, "critical", `attention:${ops.unknown}`],
      [ops.replaced, "critical", `attention:${ops.replaced}`],
    ]);
  });

  it("re-submits nothing and reads no balance", async () => {
    const ports = makeFakePorts();
    await seed(ports);
    const reads: string[] = [];
    for (const chain of ports.chains.values()) {
      for (const method of ["getNativeBalance", "getErc20Balance", "readContract", "estimateGas"] as const) {
        const original = chain[method].bind(chain) as (...args: unknown[]) => Promise<unknown>;
        (chain as unknown as Record<string, unknown>)[method] = (...args: unknown[]) => {
          reads.push(method);
          return original(...args);
        };
      }
      chain.setNativeBalance(ports.signer, 10n ** 21n);
    }
    const operationsBefore = (await ports.journal.listOperations()).length;
    const transactionsBefore = ports.journal.transactions.size;
    await reconcile({
      journal: ports.journal,
      executor: ports.executor,
      notifier: ports.notifier,
      logger: ports.logger,
    });
    expect(ports.executor.submissions).toEqual([]);
    expect(reads).toEqual([]);
    expect((await ports.journal.listOperations()).length).toBe(operationsBefore);
    expect(ports.journal.transactions.size).toBe(transactionsBefore);
    expect(await ports.journal.ledger.holdings()).toEqual([]);
  });

  it("is idempotent: a second run raises no new notification", async () => {
    const ports = makeFakePorts();
    await seed(ports);
    const deps = { journal: ports.journal, executor: ports.executor, notifier: ports.notifier, logger: ports.logger };
    await reconcile(deps);
    const second = await reconcile(deps);
    expect(second.attention).toEqual([]);
    expect(ports.notifier.sent).toHaveLength(2);
  });

  it("leaves the operation open when recover() finds its nonce consumed but not yet confirmations deep", async () => {
    const { ports, executor, op, key } = await withRealExecutor(shallowConsumedRpc(7));
    const report = await reconcile({
      journal: ports.journal,
      executor,
      notifier: ports.notifier,
      logger: ports.logger,
    });
    expect(report.recovery.unknown).toEqual([]);
    expect(report.attention).toEqual([]);
    expect(report.resumable).toEqual([op]);
    expect((await ports.journal.getOperation(op))?.status).toBe("open");
    expect((await ports.journal.getTransaction(key))?.status).toBe("broadcast");
    expect(ports.notifier.sent).toEqual([]);
  });

  it("leaves the operation open when every chain read fails during recover()", async () => {
    const failing = new Proxy({} as ExecutorRpc, {
      get: () => async () => {
        throw new RpcFailure("HTTP request failed.", null, false);
      },
    });
    const { ports, executor, op, key } = await withRealExecutor(failing);
    const report = await reconcile({
      journal: ports.journal,
      executor,
      notifier: ports.notifier,
      logger: ports.logger,
    });
    expect(report.recovery).toEqual({ resolved: 0, rebroadcast: 0, unknown: [] });
    expect(report.attention).toEqual([]);
    expect((await ports.journal.getOperation(op))?.status).toBe("open");
    expect((await ports.journal.getTransaction(key))?.status).toBe("broadcast");
    expect(ports.notifier.sent).toEqual([]);
  });
});

const SIGNER = privateKeyToAccount(ANVIL_ACCOUNTS[0]!.privateKey);

/** Head 100, `confirmations` 3: the nonce is consumed on `latest` but not at block 98; the hash is unknown. */
function shallowConsumedRpc(nonce: number): ExecutorRpc {
  const refuse = async () => {
    throw new Error("not expected during recovery");
  };
  return {
    call: refuse,
    estimateGas: refuse,
    feeData: refuse,
    sendRawTransaction: refuse,
    getBalance: refuse,
    getBlockNumber: async () => 100n,
    getNonce: async (_address, block) => (block === "latest" || block === "pending" ? nonce + 1 : nonce),
    getReceipt: async () => null,
    getTransaction: async () => null,
  };
}

async function withRealExecutor(rpc: ExecutorRpc) {
  const ports = makeFakePorts();
  const op = (
    await ports.journal.createOperation({
      kind: "refill",
      description: "refill",
      scopes: [{ kind: "arbitration", pairId: "usdc-home" }],
      pairId: "usdc-home",
      payload: null,
    })
  ).id;
  const key = `op:${op}:step:send`;
  await ports.journal.recordTransaction({ ...record(op, "send", "broadcast"), from: SIGNER.address, nonce: 7 });
  const executor = new PlatformExecutor({
    account: SIGNER,
    chains: new Map([[1003, { chainId: 1003, name: "home", confirmations: 3, rpc }]]),
    journal: ports.journal,
    clock: new FakeClock(),
    logger: ports.logger,
    notifier: ports.notifier,
    redact: (text) => text,
    signal: new AbortController().signal,
    options: {
      waitMs: 0,
      pollIntervalMs: 10,
      stuckAfterMs: 3_600_000,
      baseFeeMultiplier: 2,
      gasLimitBufferPercent: 20,
      replayMaxAttempts: 5,
      replayMaxAgeMs: 600_000,
    },
  });
  return { ports, executor, op, key };
}
