import { keccak256, parseTransaction, serializeTransaction, size, type TransactionSerializable } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import type { Address, ChainId, Hex, TxRequest } from "../../domain";
import type { TransactionRecord } from "../../ports";
import { FakeJournal } from "../../testing/fakeJournal";
import { FakeLogger } from "../../testing/fakeLogger";
import { FakeNotifier } from "../../testing/fakeNotifier";
import { RpcFailure } from "../executor/rpc";
import { createGasMonitor } from "./gasMonitor";
import { chargesL1DataFee, L1_FEE_HEADROOM, type NextTransaction } from "./l1DataFee";
import { maxCostOf, readGasReserve, type ReserveRpc } from "./reserve";

const account = privateKeyToAccount("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
const SIGNER = account.address;
const TO: Address = "0x00000000000000000000000000000000000000cc";
const BALANCE = 10n ** 18n;
const PER_BYTE = 1000n;

/** Block-pinned reads at block 7 with a fake oracle quoting `PER_BYTE` per payload byte, recording each call. */
function fakeRpc(count = 0) {
  const calls: Array<{ payload: Hex; block: bigint }> = [];
  const rpc: ReserveRpc = {
    getBlockNumber: async () => 7n,
    getBalance: async () => BALANCE,
    getNonce: async () => count,
    getL1Fee: async (payload, block) => {
      calls.push({ payload, block });
      return BigInt(size(payload)) * PER_BYTE;
    },
  };
  return { rpc, calls };
}

function eip1559Input(chainId: ChainId, nonce = 0): TransactionSerializable {
  return {
    chainId,
    type: "eip1559",
    to: TO,
    value: 7n,
    nonce,
    gas: 21_000n,
    maxFeePerGas: 3_000_000_000n,
    maxPriorityFeePerGas: 1n,
  };
}

let seq = 0;

/** A nonce-holding record of `SIGNER` on `chainId`, signed from `input`. */
async function signedRecord(
  journal: FakeJournal,
  chainId: ChainId,
  input: TransactionSerializable,
  status: "signed" | "broadcast" | "unknown" = "broadcast"
): Promise<TransactionRecord> {
  seq += 1;
  const raw = await account.signTransaction(input as never);
  return journal.recordTransaction({
    idempotencyKey: `op:op-${seq}:step:send`,
    operationId: `op-${seq}`,
    chainId,
    from: SIGNER,
    to: TO,
    value: input.value ?? 0n,
    data: null,
    nonce: input.nonce ?? 0,
    hash: keccak256(raw),
    signedRaw: raw,
    status,
    error: null,
    replacedByHash: null,
    blockNumber: null,
  });
}

const quoted = (payload: Hex) => L1_FEE_HEADROOM * BigInt(size(payload)) * PER_BYTE;

describe("gas reserve L1 data fee (OP-stack)", () => {
  it("adds an unmined record's L1 fee on Base and Base Sepolia: 2x the quote of its unsigned bytes", async () => {
    for (const chainId of [8453, 84532]) {
      const journal = new FakeJournal();
      const input = eip1559Input(chainId);
      const record = await signedRecord(journal, chainId, input);
      const { rpc, calls } = fakeRpc(0);
      const reserve = await readGasReserve({ rpc, journal, chainId, signer: SIGNER });
      const unsigned = serializeTransaction(input);
      expect(unsigned).not.toBe(record.signedRaw);
      expect(calls).toEqual([{ payload: unsigned, block: 7n }]);
      expect(reserve.inFlightWei).toBe(maxCostOf(record) + quoted(unsigned));
      expect(reserve.reserveWei).toBe(BALANCE - reserve.inFlightWei);
      expect(reserve.nextL1FeeWei).toBe(0n);
      expect(reserve.inFlight).toEqual([record.idempotencyKey]);
    }
  });

  it("prices the transaction about to be signed as the executor signs it, outside reserveWei", async () => {
    const request: TxRequest = { chainId: 8453, to: TO, value: 5n, data: "0x1234" };
    const next: NextTransaction = {
      request,
      gas: 50_000n,
      fees: { type: "eip1559", maxFeePerGas: 9n, maxPriorityFeePerGas: 1n },
    };
    const { rpc, calls } = fakeRpc(0);
    const reserve = await readGasReserve({ rpc, journal: new FakeJournal(), chainId: 8453, signer: SIGNER, next });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.block).toBe(7n);
    expect(reserve.nextL1FeeWei).toBe(quoted(calls[0]!.payload));
    expect(reserve.inFlightWei).toBe(0n);
    expect(reserve.reserveWei).toBe(BALANCE);
    const parsed = parseTransaction(calls[0]!.payload);
    expect(parsed).toMatchObject({
      type: "eip1559",
      chainId: 8453,
      to: TO,
      value: 5n,
      data: "0x1234",
      gas: 50_000n,
      maxFeePerGas: 9n,
      maxPriorityFeePerGas: 1n,
      nonce: 0xffffffff,
    });
    expect(parsed.r).toBeUndefined();

    const legacy = fakeRpc(0);
    await readGasReserve({
      rpc: legacy.rpc,
      journal: new FakeJournal(),
      chainId: 8453,
      signer: SIGNER,
      next: { ...next, fees: { type: "legacy", gasPrice: 9n } },
    });
    expect(parseTransaction(legacy.calls[0]!.payload)).toMatchObject({ type: "legacy", gasPrice: 9n, chainId: 8453 });
  });

  it("reads no oracle on Base when nothing is unmined and nothing is about to be signed", async () => {
    const empty = fakeRpc(0);
    const none = await readGasReserve({ rpc: empty.rpc, journal: new FakeJournal(), chainId: 8453, signer: SIGNER });
    expect(none).toMatchObject({ inFlightWei: 0n, nextL1FeeWei: 0n, reserveWei: BALANCE });
    expect(empty.calls).toEqual([]);

    const journal = new FakeJournal();
    await signedRecord(journal, 8453, eip1559Input(8453, 0));
    const mined = fakeRpc(1);
    const reserve = await readGasReserve({ rpc: mined.rpc, journal, chainId: 8453, signer: SIGNER });
    expect(reserve.inFlightWei).toBe(0n);
    expect(mined.calls).toEqual([]);
  });

  it("never reads an oracle on chains without an L1 data fee", async () => {
    for (const chainId of [42161, 421614, 5042002, 31337]) {
      expect(chargesL1DataFee(chainId)).toBe(false);
      const journal = new FakeJournal();
      const record = await signedRecord(journal, chainId, eip1559Input(chainId));
      const rpc: ReserveRpc = {
        ...fakeRpc(0).rpc,
        getL1Fee: () => {
          throw new Error(`oracle read on ${chainId}`);
        },
      };
      const next: NextTransaction = {
        request: { chainId, to: TO, value: 1n },
        gas: 21_000n,
        fees: { type: "eip1559", maxFeePerGas: 9n, maxPriorityFeePerGas: 1n },
      };
      const reserve = await readGasReserve({ rpc, journal, chainId, signer: SIGNER, next });
      expect(reserve.inFlightWei).toBe(maxCostOf(record));
      expect(reserve.nextL1FeeWei).toBe(0n);
    }
    expect(chargesL1DataFee(8453)).toBe(true);
    expect(chargesL1DataFee(84532)).toBe(true);
  });

  it("fails closed on Base when the L1 data fee cannot be read", async () => {
    const failure = new RpcFailure("L1 data fee unavailable: HTTP request failed.", null, false);
    const failing: ReserveRpc = {
      ...fakeRpc(0).rpc,
      getL1Fee: async () => {
        throw failure;
      },
    };
    const journal = new FakeJournal();
    await signedRecord(journal, 8453, eip1559Input(8453));
    await expect(readGasReserve({ rpc: failing, journal, chainId: 8453, signer: SIGNER })).rejects.toBe(failure);
    const next: NextTransaction = {
      request: { chainId: 8453, to: TO, value: 1n },
      gas: 21_000n,
      fees: { type: "eip1559", maxFeePerGas: 9n, maxPriorityFeePerGas: 1n },
    };
    await expect(
      readGasReserve({ rpc: failing, journal: new FakeJournal(), chainId: 8453, signer: SIGNER, next })
    ).rejects.toBe(failure);

    // An RPC that cannot read the oracle on an OP-stack chain is never taken as a zero fee.
    const { getL1Fee: _, ...withoutOracle } = fakeRpc(0).rpc;
    await expect(readGasReserve({ rpc: withoutOracle, journal, chainId: 8453, signer: SIGNER })).rejects.toThrow(
      /charges an L1 data fee/
    );

    // A nonce without signed bytes still fails as before, ahead of any oracle read.
    const broken = new FakeJournal();
    await broken.recordTransaction({
      idempotencyKey: "op:op-broken:step:send",
      operationId: "op-broken",
      chainId: 8453,
      from: SIGNER,
      to: TO,
      value: 1n,
      data: null,
      nonce: 0,
      hash: null,
      signedRaw: null,
      status: "signed",
      error: null,
      replacedByHash: null,
      blockNumber: null,
    });
    const { rpc, calls } = fakeRpc(0);
    await expect(readGasReserve({ rpc, journal: broken, chainId: 8453, signer: SIGNER })).rejects.toThrow(
      /without signed bytes/
    );
    expect(calls).toEqual([]);
  });

  it("prices a legacy record signed before this change from its unsigned EIP-155 bytes", async () => {
    const journal = new FakeJournal();
    const legacyInput: TransactionSerializable = {
      chainId: 8453,
      type: "legacy",
      to: TO,
      value: 3n,
      nonce: 0,
      gas: 21_000n,
      gasPrice: 2_000_000_000n,
    };
    const record = await signedRecord(journal, 8453, legacyInput, "unknown");
    const { rpc, calls } = fakeRpc(0);
    const reserve = await readGasReserve({ rpc, journal, chainId: 8453, signer: SIGNER });
    expect(calls.map((c) => c.payload)).toEqual([serializeTransaction(legacyInput)]);
    const parsed = parseTransaction(calls[0]!.payload);
    expect(parsed.chainId).toBe(8453);
    expect(parsed.v).toBeUndefined();
    expect(parsed.r).toBeUndefined();
    expect(parsed.s).toBeUndefined();
    expect(reserve.inFlightWei).toBe(maxCostOf(record) + quoted(calls[0]!.payload));
  });

  it("gas:8453 counts the unmined record's L1 fee; an unreadable oracle fails the tick unrecorded", async () => {
    const topology = {
      chains: [
        {
          id: 8453,
          name: "base",
          rpcUrlEnv: "BASE_RPC_URL",
          nativeSymbol: "ETH",
          nativeDecimals: 18,
          confirmations: 3,
        },
      ],
      pairs: [],
      routes: [],
    };
    const monitorWith = (journal: FakeJournal, rpc: ReserveRpc) =>
      createGasMonitor({
        topology,
        reserveRpc: new Map([[8453, rpc]]),
        journal,
        notifier: new FakeNotifier(),
        logger: new FakeLogger(),
        signer: SIGNER,
        minimumFor: () => 1n,
      });
    const ctx = { now: new Date(), signal: new AbortController().signal };

    const journal = new FakeJournal();
    const input = eip1559Input(8453);
    const record = await signedRecord(journal, 8453, input);
    const { rpc } = fakeRpc(0);
    await monitorWith(journal, rpc).tick(ctx);
    const inFlight = maxCostOf(record) + quoted(serializeTransaction(input));
    const [observation] = await journal.observations("gas:8453");
    expect(observation?.value).toMatchObject({ inFlightWei: inFlight, reserveWei: BALANCE - inFlight });

    const fresh = new FakeJournal();
    await signedRecord(fresh, 8453, eip1559Input(8453));
    const failing: ReserveRpc = {
      ...rpc,
      getL1Fee: async () => {
        throw new RpcFailure("L1 data fee unavailable: HTTP request failed.", null, false);
      },
    };
    const result = await monitorWith(fresh, failing).tick(ctx);
    expect(result.status).toBe("failed");
    expect(result.summary).toContain("L1 data fee unavailable");
    expect(await fresh.observations("gas:8453")).toEqual([]);
  });
});
