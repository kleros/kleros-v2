import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { BaseError, http, parseAbi } from "viem";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Address, Hex } from "../../domain";
import type { ChainClient } from "../../ports";
import { Redactor } from "../redact";
import { ANVIL_ACCOUNTS, REVERTING_RUNTIME, REVERT_SELECTOR, startAnvil, type AnvilInstance } from "../testkit/anvil";
import { RpcFailure, ViemExecutorRpc } from "../executor/rpc";
import { ViemChainClient } from "./chainClient";

const REVERTER: Address = "0x00000000000000000000000000000000000000ee";
const EMPTY: Address = "0x00000000000000000000000000000000000000ef";
/** A contract with no `feeToken()`, no `receive()` and no fallback: every call reverts with empty data. */
const NO_FUNCTIONS: Address = "0x00000000000000000000000000000000000000ed";
const EMPTY_REVERT_RUNTIME: Hex = "0x60006000fd";
const feeTokenAbi = parseAbi(["function feeToken() view returns (address)"]);
const abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);
const FAKE_KEY = "FAKEKEY0123456789abcdef";
const UNREACHABLE = `http://127.0.0.1:1/v2/${FAKE_KEY}`;
const identity = (text: string) => text;

/**
 * A local HTTP endpoint standing in for a misbehaving node: `respond` answers each JSON-RPC request (status and
 * body), or never answers when it returns `null` (a hung request).
 */
async function fakeNode(
  respond: (method: string) => { status: number; body: string; json?: boolean } | null
): Promise<{ url: string; close: () => Promise<void> }> {
  const server: Server = createServer((request, response) => {
    let raw = "";
    request.on("data", (chunk: Buffer) => (raw += chunk.toString()));
    request.on("end", () => {
      const { method } = JSON.parse(raw || "{}") as { method?: string };
      const answer = respond(method ?? "");
      if (!answer) return;
      response.writeHead(answer.status, { "Content-Type": answer.json ? "application/json" : "text/plain" });
      response.end(answer.body);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}/v2/${FAKE_KEY}`,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

/** Every `ChainClient` method, called with arguments that make sense on any chain. */
function everyMethod(client: ChainClient): Array<[string, () => Promise<unknown>]> {
  const hash: Hex = `0x${"11".repeat(32)}`;
  const signer = ANVIL_ACCOUNTS[0]!.address;
  return [
    ["getBlockNumber", () => client.getBlockNumber()],
    ["getNativeBalance", () => client.getNativeBalance(signer)],
    ["getErc20Balance", () => client.getErc20Balance(REVERTER, signer)],
    ["getCode", () => client.getCode(REVERTER)],
    ["readContract", () => client.readContract({ address: REVERTER, abi, functionName: "balanceOf", args: [signer] })],
    ["estimateGas", () => client.estimateGas({ chainId: 31337, to: REVERTER, value: 0n, data: "0x12" }, signer)],
    ["getTransactionReceipt", () => client.getTransactionReceipt(hash)],
    ["getTransaction", () => client.getTransaction(hash)],
    ["getTransactionCount", () => client.getTransactionCount(signer, "pending")],
  ];
}

describe("ViemChainClient", () => {
  let anvil: AnvilInstance;
  let client: ViemChainClient;

  beforeAll(async () => {
    anvil = await startAnvil();
    await anvil.rpc("anvil_setCode", [REVERTER, REVERTING_RUNTIME]);
    await anvil.rpc("anvil_setCode", [NO_FUNCTIONS, EMPTY_REVERT_RUNTIME]);
    client = new ViemChainClient(31337, http(anvil.url, { retryCount: 0 }), new Redactor([anvil.url]).text);
  });

  afterAll(async () => {
    await anvil.stop();
  });

  it("reads the chain", async () => {
    const signer = ANVIL_ACCOUNTS[0]!.address;
    expect(await client.getBlockNumber()).toBeGreaterThanOrEqual(0n);
    expect(await client.getNativeBalance(signer)).toBeGreaterThan(0n);
    expect(await client.getCode(REVERTER)).toBe(REVERTING_RUNTIME);
    expect(await client.getCode(EMPTY)).toBe("0x");
    expect(await client.getTransactionCount(signer, "latest")).toBe(0);
    expect(await client.getTransactionReceipt(`0x${"22".repeat(32)}`)).toBeNull();
    expect(await client.getTransaction(`0x${"22".repeat(32)}`)).toBeNull();
    expect(await client.estimateGas({ chainId: 31337, to: EMPTY, value: 1n }, signer)).toBe(21_000n);
  });

  it("rethrows reverts as plain errors with the short message and the revert data", async () => {
    for (const run of [
      () => client.estimateGas({ chainId: 31337, to: REVERTER, value: 0n, data: "0x12" }, ANVIL_ACCOUNTS[0]!.address),
      () => client.readContract({ address: REVERTER, abi, functionName: "balanceOf", args: [EMPTY] }),
    ]) {
      const error = await run().then(
        () => undefined,
        (e: unknown) => e
      );
      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(BaseError);
      expect((error as Error & { cause?: unknown }).cause).toBeUndefined();
      expect((error as Error).message).toMatch(new RegExp(`revertData=${REVERT_SELECTOR}$`));
      expect((error as Error).message).not.toContain(anvil.url);
    }
  });

  it("marks an empty-data revert revertData=none and a transport error with no marker (L42)", async () => {
    const signer = ANVIL_ACCOUNTS[0]!.address;
    const failure = (run: () => Promise<unknown>) =>
      run().then(
        () => new Error("unexpectedly succeeded"),
        (e: unknown) => e as Error
      );
    // `feeToken()` on a reporter that has no such function (and no fallback): reverted without data.
    const missing = await failure(() =>
      client.readContract({ address: NO_FUNCTIONS, abi: feeTokenAbi, functionName: "feeToken" })
    );
    expect(missing.message).toMatch(/ revertData=none$/);
    // A value transfer to a contract without `receive()`.
    const noReceive = await failure(() => client.estimateGas({ chainId: 31337, to: NO_FUNCTIONS, value: 1n }, signer));
    expect(noReceive.message).toMatch(/ revertData=none$/);
    for (const error of [missing, noReceive]) expect(error.message).not.toContain(anvil.url);

    // The same calls against a stopped node: a transport error, never a revert marker.
    const stopped = await startAnvil();
    const url = stopped.url;
    await stopped.stop();
    const dead = new ViemChainClient(31337, http(url, { retryCount: 0 }), new Redactor([url]).text);
    for (const [name, run] of [
      ...everyMethod(dead),
      ["feeToken", () => dead.readContract({ address: NO_FUNCTIONS, abi: feeTokenAbi, functionName: "feeToken" })],
      ["estimateGas value", () => dead.estimateGas({ chainId: 31337, to: NO_FUNCTIONS, value: 1n }, signer)],
    ] as Array<[string, () => Promise<unknown>]>) {
      const error = await failure(run);
      expect(error.message, name).not.toContain("revertData=");
      expect(error.message, name).not.toContain(url);
    }
  });

  it("marks no HTTP error, timeout or non-revert node error with hex data as a revert (L52, L60)", async () => {
    const signer = ANVIL_ACCOUNTS[0]!.address;
    const cases: Array<[string, (method: string) => { status: number; body: string; json?: boolean } | null]> = [
      ["HTTP 500", () => ({ status: 500, body: "Internal Server Error" })],
      [
        "HTTP 502 with a JSON body carrying hex data",
        () => ({
          status: 502,
          json: true,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            error: { code: -32000, message: "bad gateway", data: "0xdead" },
          }),
        }),
      ],
      [
        "a node error that is not a revert, with hex data",
        () => ({
          status: 200,
          json: true,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            error: { code: -32005, message: "rate limited", data: "0xbeef" },
          }),
        }),
      ],
      ["timeout", () => null],
    ];
    for (const [name, respond] of cases) {
      const node = await fakeNode(respond);
      try {
        const broken = new ViemChainClient(
          31337,
          http(node.url, { retryCount: 0, timeout: 200 }),
          new Redactor([node.url]).text
        );
        for (const [method, run] of [
          ...everyMethod(broken),
          [
            "feeToken",
            () => broken.readContract({ address: NO_FUNCTIONS, abi: feeTokenAbi, functionName: "feeToken" }),
          ],
          ["estimateGas value", () => broken.estimateGas({ chainId: 31337, to: NO_FUNCTIONS, value: 1n }, signer)],
        ] as Array<[string, () => Promise<unknown>]>) {
          const error = await run().then(
            () => new Error("unexpectedly succeeded"),
            (e: unknown) => e as Error
          );
          expect(error.message, `${name} ${method}`).not.toBe("unexpectedly succeeded");
          expect(error.message, `${name} ${method}`).not.toContain("revertData=");
          expect(error.message, `${name} ${method}`).not.toContain(FAKE_KEY);
        }
      } finally {
        await node.close();
      }
    }
  });

  it("marks no 5xx as a revert even when its body says execution reverted (L70)", async () => {
    const signer = ANVIL_ACCOUNTS[0]!.address;
    const reverted = { code: 3, message: "execution reverted", data: REVERT_SELECTOR };
    const cases: Array<[string, () => { status: number; body: string; json?: boolean }]> = [
      ["HTTP 500, text body", () => ({ status: 500, body: "execution reverted" })],
      [
        "HTTP 500, JSON-RPC revert body",
        () => ({ status: 500, json: true, body: JSON.stringify({ jsonrpc: "2.0", id: 1, error: reverted }) }),
      ],
      [
        "HTTP 503, JSON-RPC revert body without data",
        () => ({
          status: 503,
          json: true,
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted" } }),
        }),
      ],
    ];
    for (const [name, respond] of cases) {
      const node = await fakeNode(respond);
      try {
        const redact = new Redactor([node.url]).text;
        const broken = new ViemChainClient(31337, http(node.url, { retryCount: 0, timeout: 1_000 }), redact);
        const rpc = new ViemExecutorRpc(http(node.url, { retryCount: 0, timeout: 1_000 }), redact, 31337);
        const request = { chainId: 31337, to: REVERTER, value: 0n, data: "0x12" as Hex };
        for (const [method, run] of [
          ["call", () => broken.readContract({ address: REVERTER, abi, functionName: "balanceOf", args: [signer] })],
          ["estimateGas", () => broken.estimateGas(request, signer)],
        ] as Array<[string, () => Promise<unknown>]>) {
          const error = await run().then(
            () => new Error("unexpectedly succeeded"),
            (e: unknown) => e as Error
          );
          expect(error.message, `${name} ${method}`).not.toBe("unexpectedly succeeded");
          expect(error.message, `${name} ${method}`).not.toContain("revertData=");
          expect(error.message, `${name} ${method}`).not.toContain(FAKE_KEY);
        }
        for (const [method, run] of [
          ["executor call", () => rpc.call(request, signer)],
          ["executor estimateGas", () => rpc.estimateGas(request, signer)],
        ] as Array<[string, () => Promise<unknown>]>) {
          const error = await run().then(
            () => new Error("unexpectedly succeeded"),
            (e: unknown) => e
          );
          expect(error, `${name} ${method}`).toBeInstanceOf(RpcFailure);
          expect((error as RpcFailure).revert, `${name} ${method}`).toBe(false);
          expect((error as RpcFailure).revertData, `${name} ${method}`).toBeNull();
          expect((error as RpcFailure).message, `${name} ${method}`).not.toContain(FAKE_KEY);
        }
      } finally {
        await node.close();
      }
    }
  });

  it("never leaks the URL or its embedded key from any method, even without a redactor", async () => {
    const dead = new ViemChainClient(31337, http(UNREACHABLE, { retryCount: 0 }), identity);
    for (const [name, run] of everyMethod(dead)) {
      const error = await run().then(
        () => new Error(`${name} unexpectedly succeeded`),
        (e: unknown) => e as Error
      );
      expect(error, name).not.toBeInstanceOf(BaseError);
      expect(error.message, name).toBe("HTTP request failed.");
      expect(`${error.message} ${error.stack ?? ""}`, name).not.toContain(FAKE_KEY);
      expect(`${error.message} ${error.stack ?? ""}`, name).not.toContain("127.0.0.1:1");
    }
  });

  it("keeps every error message free of the URL on a live node too", async () => {
    for (const [name, run] of everyMethod(client)) {
      await run().catch((error: Error) => {
        expect(error.message, name).not.toContain(anvil.url);
      });
    }
  });
});
