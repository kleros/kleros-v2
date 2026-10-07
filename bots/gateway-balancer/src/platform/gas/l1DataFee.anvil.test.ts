import { randomUUID } from "node:crypto";
import { http, keccak256, size, type LocalAccount } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Address, Hex, TxRequest } from "../../domain";
import { FakeJournal } from "../../testing/fakeJournal";
import { FakeLogger } from "../../testing/fakeLogger";
import { FakeNotifier } from "../../testing/fakeNotifier";
import { systemClock } from "../clock";
import { PlatformExecutor, withBuffer } from "../executor/executor";
import { RpcFailure, ViemExecutorRpc } from "../executor/rpc";
import { Redactor } from "../redact";
import { REVERTING_RUNTIME, startAnvil, type AnvilInstance } from "../testkit/anvil";
import { GAS_PRICE_ORACLE, L1_FEE_HEADROOM, unsignedPayloadOf, unsignedPayloadOfSigned } from "./l1DataFee";
import { maxCostOf, readGasReserve } from "./reserve";

const CHAIN_ID = 84532;
const RECIPIENT: Address = "0x00000000000000000000000000000000000000cc";
const ETH = 10n ** 18n;

/**
 * A fake GasPriceOracle: on any call it returns the length word of its `bytes` argument (calldata offset 0x24)
 * times `perByte`.
 */
function oracleRuntime(perByte: bigint): Hex {
  return `0x6024357f${perByte.toString(16).padStart(64, "0")}0260005260206000f3`;
}

/** A fake GasPriceOracle quoting the length word of its `bytes` argument times the block number. */
const BLOCK_NUMBER_ORACLE: Hex = "0x602435430260005260206000f3";

let anvil: AnvilInstance;

beforeAll(async () => {
  // Anvil takes 84532 for Base and then charges an L1 data fee of its own model, not the etched oracle's quote:
  // as an Ethereum-family node the etched oracle is the only L1 fee model, so a balance check here is exact.
  anvil = await startAnvil(CHAIN_ID, ["--network", "ethereum"]);
  await anvil.rpc("anvil_setCode", [GAS_PRICE_ORACLE, oracleRuntime(1000n)]);
  await anvil.rpc("evm_mine");
});

afterAll(async () => {
  await anvil.stop();
});

afterEach(async () => {
  await anvil.rpc("evm_setAutomine", [true]);
  await anvil.rpc("evm_mine");
  await anvil.rpc("anvil_setCode", [GAS_PRICE_ORACLE, oracleRuntime(1000n)]);
  await anvil.rpc("evm_mine");
});

const rpcOf = (url = anvil.url) =>
  new ViemExecutorRpc(http(url, { retryCount: 0 }), new Redactor([url]).text, CHAIN_ID);
const transfer = (value = 1_000n): TxRequest => ({ chainId: CHAIN_ID, to: RECIPIENT, value });
const head = async () => BigInt(await anvil.rpc<Hex>("eth_blockNumber"));
const PAYLOAD: Hex = `0x${"ab".repeat(100)}`;

async function fundedAccount(balance: bigint) {
  const fresh = privateKeyToAccount(generatePrivateKey());
  await anvil.rpc("anvil_setBalance", [fresh.address, `0x${balance.toString(16)}`]);
  return fresh;
}

const keyOf = () => {
  const id = randomUUID();
  return { idempotencyKey: `op:${id}:step:send`, operationId: id };
};

/** A PlatformExecutor on 84532 over the real RPC, signing with `eoa`. */
function executorOf(eoa: LocalAccount, waitMs: number) {
  const journal = new FakeJournal();
  const notifier = new FakeNotifier();
  const redact = new Redactor([anvil.url]).text;
  const executor = new PlatformExecutor({
    account: eoa,
    chains: new Map([
      [
        CHAIN_ID,
        {
          chainId: CHAIN_ID,
          name: "base-sepolia",
          confirmations: 1,
          rpc: new ViemExecutorRpc(http(anvil.url, { retryCount: 0 }), redact, CHAIN_ID),
        },
      ],
    ]),
    journal,
    clock: systemClock,
    logger: new FakeLogger(),
    notifier,
    redact,
    signal: new AbortController().signal,
    options: {
      waitMs,
      pollIntervalMs: 50,
      stuckAfterMs: 3_600_000,
      baseFeeMultiplier: 2,
      gasLimitBufferPercent: 20,
      replayMaxAttempts: 5,
      replayMaxAgeMs: 600_000,
    },
  });
  return { executor, journal, notifier };
}

const pendingNonce = async (address: Address) =>
  Number(await anvil.rpc<Hex>("eth_getTransactionCount", [address, "pending"]));

describe("OP-stack L1 data fee over a local anvil (84532)", () => {
  it("ViemExecutorRpc.getL1Fee calls getL1Fee(bytes) on the predeploy at the given block", async () => {
    const rpc = rpcOf();
    expect(await rpc.getL1Fee(PAYLOAD, await head())).toBe(BigInt(size(PAYLOAD)) * 1000n);
    // Anvil folds an etch into the state of the block before it, so the pinned block is shown by an oracle whose
    // quote is the block number times the payload length.
    await anvil.rpc("anvil_setCode", [GAS_PRICE_ORACLE, BLOCK_NUMBER_ORACLE]);
    await anvil.rpc("evm_mine");
    await anvil.rpc("evm_mine");
    const n = await head();
    expect(await rpc.getL1Fee(PAYLOAD, n - 1n)).toBe(BigInt(size(PAYLOAD)) * (n - 1n));
    expect(await rpc.getL1Fee(PAYLOAD, n)).toBe(BigInt(size(PAYLOAD)) * n);
  });

  it("every oracle failure is a non-revert RpcFailure without revert data or URL", async () => {
    const unreachable = "http://127.0.0.1:1/v2/FAKEKEY0123";
    const cases: Array<{ name: string; code?: Hex; url?: string }> = [
      { name: "reverting oracle", code: REVERTING_RUNTIME },
      { name: "no code at the predeploy", code: "0x" },
      { name: "unreachable node", url: unreachable },
    ];
    for (const c of cases) {
      if (c.code !== undefined) {
        await anvil.rpc("anvil_setCode", [GAS_PRICE_ORACLE, c.code]);
        await anvil.rpc("evm_mine");
      }
      const url = c.url ?? anvil.url;
      const rpc = new ViemExecutorRpc(http(url, { retryCount: 0, timeout: 1_000 }), new Redactor([url]).text, CHAIN_ID);
      const error = await rpc.getL1Fee(PAYLOAD, await head()).then(
        () => null,
        (e: unknown) => e
      );
      expect(error, c.name).toBeInstanceOf(RpcFailure);
      const failure = error as RpcFailure;
      expect(failure.revert, c.name).toBe(false);
      expect(failure.revertData, c.name).toBeNull();
      expect(failure.message, c.name).toMatch(/^L1 data fee unavailable: /);
      expect(failure.message, c.name).not.toContain(url);
      expect(failure.message, c.name).not.toContain("FAKEKEY");
    }
  });

  it("readGasReserve over the real RPC adds an unmined record's and the next transaction's L1 data fee", async () => {
    const eoa = await fundedAccount(ETH);
    const journal = new FakeJournal();
    const raw = await eoa.signTransaction({
      chainId: CHAIN_ID,
      type: "eip1559",
      to: RECIPIENT,
      value: 5n,
      nonce: 0,
      gas: 21_000n,
      maxFeePerGas: 2_000_000_000n,
      maxPriorityFeePerGas: 1n,
    });
    // Only in the journal, never sent: unmined.
    const record = await journal.recordTransaction({
      idempotencyKey: "op:op-l1:step:send",
      operationId: "op-l1",
      chainId: CHAIN_ID,
      from: eoa.address,
      to: RECIPIENT,
      value: 5n,
      data: null,
      nonce: 0,
      hash: keccak256(raw),
      signedRaw: raw,
      status: "broadcast",
      error: null,
      replacedByHash: null,
      blockNumber: null,
    });
    const rpc = rpcOf();
    const next = {
      request: transfer(0n),
      gas: 25_200n,
      fees: await rpc.feeData(2),
    };
    const reserve = await readGasReserve({ rpc, journal, chainId: CHAIN_ID, signer: eoa.address, next });
    expect(reserve.inFlightWei).toBe(
      maxCostOf(record) + L1_FEE_HEADROOM * BigInt(size(unsignedPayloadOfSigned(raw))) * 1000n
    );
    expect(reserve.nextL1FeeWei).toBe(L1_FEE_HEADROOM * BigInt(size(unsignedPayloadOf(CHAIN_ID, next))) * 1000n);
    expect(reserve.reserveWei).toBe(ETH - reserve.inFlightWei);
  });

  it("an unmined record whose L1 data fee cannot be read fails the next submit with the aborted: form", async () => {
    const eoa = await fundedAccount(ETH);
    const { executor, journal, notifier } = executorOf(eoa, 300);

    await anvil.rpc("evm_setAutomine", [false]);
    const first = await executor.submit(transfer(1000n), keyOf());
    expect(first.status).toBe("pending");
    // The predeploy reverts from now on (not mined: the first transfer stays unmined).
    await anvil.rpc("anvil_setCode", [GAS_PRICE_ORACLE, REVERTING_RUNTIME]);

    const k2 = keyOf();
    const second = await executor.submit(transfer(1000n), k2);
    expect(second.status).toBe("failed");
    const error = (second as { error: string }).error;
    expect(error).toMatch(/^aborted: L1 data fee unavailable: .* revertData=none$/);
    expect(error).not.toContain(anvil.url);
    expect(await journal.getTransaction(k2.idempotencyKey)).toMatchObject({
      status: "failed",
      nonce: null,
      signedRaw: null,
    });
    expect(await pendingNonce(eoa.address)).toBe(1);
    expect(notifier.sent).toEqual([]);
  });

  it("refuses a transaction whose reserve covers its L2 gas cap but not its own L1 data fee", async () => {
    const fees = await rpcOf().feeData(2);
    if (fees.type !== "eip1559") throw new Error("anvil is eip1559");
    // What the executor prices: a plain transfer's estimate with its 20% buffer, at the fee cap of this block.
    const next = { request: transfer(0n), gas: withBuffer(21_000n, 20), fees };
    const l2 = next.gas * fees.maxFeePerGas;
    const l1 = L1_FEE_HEADROOM * BigInt(size(unsignedPayloadOf(CHAIN_ID, next))) * 1000n;
    const eoa = await fundedAccount(l2 + l1 - 1n);
    const { executor, journal, notifier } = executorOf(eoa, 5_000);

    const k1 = keyOf();
    const refused = await executor.submit(transfer(0n), k1);
    expect(refused.status).toBe("failed");
    const error = (refused as { error: string }).error;
    expect(error).toMatch(/^gas-reserve: /);
    expect(error).toContain(`is ${l2 + l1 - 1n} wei after this transaction's value`);
    expect(error).toContain(`unmined transactions 0, value 0); it needs ${l2 + l1} wei of gas, of which ${l1} is`);
    expect(error).toMatch(/ is its L1 data fee revertData=none$/);
    expect(await journal.getTransaction(k1.idempotencyKey)).toMatchObject({
      status: "failed",
      nonce: null,
      signedRaw: null,
    });
    expect(await pendingNonce(eoa.address)).toBe(0);
    expect(notifier.sent.map((n) => [n.severity, n.dedupKey])).toEqual([["critical", `gas-reserve:${CHAIN_ID}`]]);

    // One more wei covers both: the same transaction is signed and confirmed.
    await anvil.rpc("anvil_setBalance", [eoa.address, `0x${(l2 + l1).toString(16)}`]);
    expect((await executor.submit(transfer(0n), keyOf())).status).toBe("confirmed");
    expect(await pendingNonce(eoa.address)).toBe(1);
  });

  it("an unreadable L1 data fee of the next transaction fails the submit aborted: with nothing unmined", async () => {
    const eoa = await fundedAccount(ETH);
    const { executor, journal, notifier } = executorOf(eoa, 5_000);
    await anvil.rpc("anvil_setCode", [GAS_PRICE_ORACLE, REVERTING_RUNTIME]);
    await anvil.rpc("evm_mine");

    const k = keyOf();
    const outcome = await executor.submit(transfer(1000n), k);
    expect(outcome.status).toBe("failed");
    const error = (outcome as { error: string }).error;
    expect(error).toMatch(/^aborted: L1 data fee unavailable: .* revertData=none$/);
    expect(error).not.toContain(anvil.url);
    expect(await journal.getTransaction(k.idempotencyKey)).toMatchObject({
      status: "failed",
      nonce: null,
      signedRaw: null,
    });
    expect(await pendingNonce(eoa.address)).toBe(0);
    expect(notifier.sent).toEqual([]);
  });
});
