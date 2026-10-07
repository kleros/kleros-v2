import { spawn, type ChildProcess } from "node:child_process";
import type { Address, Hex } from "../../domain";

/** Anvil's first default account (public test mnemonic). */
export const ANVIL_ACCOUNTS: Array<{ address: Address; privateKey: Hex }> = [
  {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
];

export interface AnvilInstance {
  url: string;
  chainId: number;
  process: ChildProcess;
  rpc<T = unknown>(method: string, params?: unknown[]): Promise<T>;
  stop(): Promise<void>;
}

/**
 * Spawns `anvil --port 0` and reads the chosen port from its `Listening on` line, so parallel test files never race
 * for a port. `stop` kills only this child's pid.
 */
export async function startAnvil(chainId = 31337, extraArgs: string[] = []): Promise<AnvilInstance> {
  const child = spawn("anvil", ["--port", "0", "--chain-id", String(chainId), "--host", "127.0.0.1", ...extraArgs], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  const url = await new Promise<string>((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error(`anvil did not start: ${output.slice(-500)}`)), 20_000);
    const onData = (chunk: Buffer) => {
      output += chunk.toString();
      const match = /Listening on ([0-9.]+):(\d+)/.exec(output);
      if (match) {
        clearTimeout(timer);
        child.stdout?.off("data", onData);
        resolve(`http://${match[1]}:${match[2]}`);
      }
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", (chunk: Buffer) => (output += chunk.toString()));
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`anvil exited with ${code}: ${output.slice(-500)}`));
    });
  });
  // Keep draining output so the pipe never fills.
  child.stdout?.resume();
  child.stderr?.resume();
  let id = 0;
  const rpc = async <T>(method: string, params: unknown[] = []): Promise<T> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
    });
    const body = (await response.json()) as { result?: T; error?: { message: string } };
    if (body.error) throw new Error(`${method}: ${body.error.message}`);
    return body.result as T;
  };
  return {
    url,
    chainId,
    process: child,
    rpc,
    stop: () =>
      new Promise<void>((resolve) => {
        if (child.exitCode !== null || child.signalCode !== null) return resolve();
        child.once("exit", () => resolve());
        child.kill("SIGTERM");
      }),
  };
}

/** Runtime bytecode that always reverts with the 4-byte custom error `0xdeadbeef`. */
export const REVERTING_RUNTIME: Hex = "0x63deadbeef60e01b60005260046000fd";
export const REVERT_SELECTOR = "0xdeadbeef";
