import { keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import type { ChainId } from "../../domain";
import type { FakeChainClient } from "../../testing/fakeChain";
import { makeFakePorts } from "../../testing/ports";
import { createGasMonitor } from "./gasMonitor";
import { readGasReserve, type ReserveRpc } from "./reserve";

const HOME = 1003;
const FOREIGN = 1001;

/** The block-pinned reads over a fake chain (one block, so every read is at it). */
function reserveRpc(client: FakeChainClient): ReserveRpc {
  return {
    getBlockNumber: () => client.getBlockNumber(),
    getBalance: (address) => client.getNativeBalance(address),
    getNonce: (address) => client.getTransactionCount(address, "latest"),
  };
}

function setup(minimum: bigint) {
  const ports = makeFakePorts();
  for (const chain of ports.chains.values()) chain.setNativeBalance(ports.signer, 10n ** 18n);
  const rpcs = new Map<ChainId, ReserveRpc>([...ports.chains].map(([id, client]) => [id, reserveRpc(client)]));
  const monitor = createGasMonitor({
    topology: ports.config.topology,
    reserveRpc: rpcs,
    journal: ports.journal,
    notifier: ports.notifier,
    logger: ports.logger,
    signer: ports.signer,
    minimumFor: () => minimum,
  });
  const tick = () => monitor.tick({ now: ports.clock.now(), signal: new AbortController().signal });
  return { ports, tick, rpcs };
}

describe("gas monitor", () => {
  it("computes the reserve as native balance minus the native eoa holdings of that chain", async () => {
    const { ports, tick } = setup(1n);
    const base = { chainId: HOME, asset: "native" as const, operationId: "op-1", reason: "received" };
    await ports.journal.ledger.credit({
      ...base,
      scope: { kind: "arbitration", pairId: "eth-home" },
      location: "eoa",
      amount: 3n * 10n ** 17n,
    });
    await ports.journal.ledger.credit({
      ...base,
      scope: { kind: "bridging", routeId: "home->eth-home" },
      location: "eoa",
      amount: 10n ** 17n,
    });
    // In transit and other chains or assets do not count against this chain's native balance.
    await ports.journal.ledger.credit({
      ...base,
      scope: { kind: "arbitration", pairId: "eth-home" },
      location: "in-transit",
      amount: 5n,
    });
    await ports.journal.ledger.credit({
      ...base,
      chainId: FOREIGN,
      scope: { kind: "arbitration", pairId: "usdc-home" },
      location: "eoa",
      amount: 7n,
    });
    await ports.journal.ledger.credit({
      ...base,
      asset: "0x00000000000000000000000000000000000000c3",
      scope: { kind: "arbitration", pairId: "eth-home" },
      location: "eoa",
      amount: 9n,
    });
    await tick();
    const [home] = await ports.journal.observations(`gas:${HOME}`);
    expect(home?.value).toMatchObject({
      balanceWei: 10n ** 18n,
      ledgerHeldWei: 4n * 10n ** 17n,
      reserveWei: 6n * 10n ** 17n,
      low: false,
    });
    const [foreign] = await ports.journal.observations(`gas:${FOREIGN}`);
    expect(foreign?.value).toMatchObject({ reserveWei: 10n ** 18n - 7n });
  });

  it("raises one warning per low chain with a per-chain dedup key, and none above the minimum", async () => {
    const { ports, tick } = setup(5n * 10n ** 17n);
    await ports.journal.ledger.credit({
      chainId: HOME,
      asset: "native",
      operationId: "op-1",
      reason: "received",
      scope: { kind: "arbitration", pairId: "eth-home" },
      location: "eoa",
      amount: 6n * 10n ** 17n,
    });
    const result = await tick();
    expect(result.status).toBe("acted");
    expect(ports.notifier.sent.map((n) => [n.severity, n.dedupKey, n.chainId])).toEqual([
      ["warning", `gas-low:${HOME}`, HOME],
    ]);
    expect(ports.notifier.sent[0]?.action).toContain(ports.signer);
  });

  it("never credits the gas reserve to the ledger", async () => {
    const { ports, tick } = setup(2n * 10n ** 18n);
    await tick();
    await tick();
    expect(await ports.journal.ledger.holdings()).toEqual([]);
    expect(ports.journal.ledger.entries).toEqual([]);
    expect(ports.notifier.sent.filter((n) => n.dedupKey === `gas-low:${HOME}`)).toHaveLength(2);
    expect(new Set(ports.notifier.sent.map((n) => n.dedupKey)).size).toBe(3);
  });

  it("subtracts an unmined record (value plus gas at its fee cap) and reports low like the executor", async () => {
    // Without the in-flight record the reserve (10^18) is far above this minimum; with it, just below.
    const { ports, tick, rpcs } = setup(3n * 10n ** 17n);
    const value = 7n * 10n ** 17n;
    const gas = 21_000n;
    const maxFeePerGas = 3_000_000_000n;
    const raw = await privateKeyToAccount(
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    ).signTransaction({
      chainId: HOME,
      type: "eip1559",
      to: "0x00000000000000000000000000000000000000cc",
      value,
      nonce: 0,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas: 1n,
    });
    const record = {
      operationId: "op-1",
      chainId: HOME,
      from: ports.signer,
      to: "0x00000000000000000000000000000000000000cc" as const,
      value,
      data: null,
      nonce: 0,
      hash: keccak256(raw),
      signedRaw: raw,
      status: "broadcast" as const,
      error: null,
      replacedByHash: null,
      blockNumber: null,
    };
    await ports.journal.recordTransaction({ ...record, idempotencyKey: "op:op-1:step:send" });
    // A failed record holds no nonce and costs nothing; another chain's record does not count here.
    await ports.journal.recordTransaction({
      ...record,
      idempotencyKey: "op:op-2:step:send",
      status: "failed",
      nonce: null,
      hash: null,
      signedRaw: null,
    });
    await ports.journal.recordTransaction({ ...record, idempotencyKey: "op:op-3:step:send", chainId: FOREIGN });

    const inFlight = value + gas * maxFeePerGas;
    // The very function the executor checks before signing.
    const reserve = await readGasReserve({
      rpc: rpcs.get(HOME)!,
      journal: ports.journal,
      chainId: HOME,
      signer: ports.signer,
    });
    expect(reserve).toMatchObject({ inFlightWei: inFlight, reserveWei: 10n ** 18n - inFlight });
    expect(await tick()).toMatchObject({ status: "acted" });
    const [home] = await ports.journal.observations(`gas:${HOME}`);
    expect(home?.value).toMatchObject({ inFlightWei: inFlight, reserveWei: 10n ** 18n - inFlight, low: true });
    expect(ports.notifier.sent.map((n) => n.dedupKey)).toContain(`gas-low:${HOME}`);

    // Once mined (the transaction count passed its nonce) the balance already reflects it: no longer subtracted.
    ports.chains.get(HOME)!.nonces.set(ports.signer.toLowerCase(), 1);
    const mined = await readGasReserve({
      rpc: rpcs.get(HOME)!,
      journal: ports.journal,
      chainId: HOME,
      signer: ports.signer,
    });
    expect(mined).toMatchObject({ inFlightWei: 0n, reserveWei: 10n ** 18n });
  });

  it("refuses to size a nonce-holding record without signed bytes as zero gas", async () => {
    const { ports, tick } = setup(1n);
    await ports.journal.recordTransaction({
      idempotencyKey: "op:op-9:step:send",
      operationId: "op-9",
      chainId: HOME,
      from: ports.signer,
      to: "0x00000000000000000000000000000000000000cc",
      value: 1n,
      data: null,
      nonce: 4,
      hash: null,
      signedRaw: null,
      status: "signed",
      error: null,
      replacedByHash: null,
      blockNumber: null,
    });
    const result = await tick();
    expect(result.status).toBe("failed");
    expect(result.summary).toContain("without signed bytes");
    expect(await ports.journal.observations(`gas:${HOME}`)).toEqual([]);
  });

  it("keeps going when one chain cannot be read and reports the tick failed", async () => {
    const { ports, tick } = setup(1n);
    ports.chains.get(FOREIGN)!.getNativeBalance = async () => {
      throw new Error("HTTP request failed.");
    };
    const result = await tick();
    expect(result.status).toBe("failed");
    expect((await ports.journal.observations("gas:")).map((o) => o.key)).toEqual([`gas:${1002}`, `gas:${HOME}`]);
  });
});
