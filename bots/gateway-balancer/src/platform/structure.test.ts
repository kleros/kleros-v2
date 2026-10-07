import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { toFunctionSelector } from "viem";
import { describe, expect, it } from "vitest";

/** Structural guarantees over the whole bot's source (decisions [L48]); test files are not shipped code. */
const SRC = resolve(__dirname, "..");

function sourceFiles(dir = SRC): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) out.push(path);
  }
  return out;
}

const rel = (path: string) => relative(SRC, path).split(sep).join("/");

/** Calls that sign, create a signer or send a transaction. */
const SIGNING_FUNCTIONS = [
  "signTransaction",
  "signMessage",
  "signTypedData",
  "signAuthorization",
  "privateKeyToAccount",
  "mnemonicToAccount",
  "hdKeyToAccount",
  "createWalletClient",
  "sendRawTransaction",
  "sendTransaction",
  "writeContract",
  "deployContract",
];
const SIGNING_API = new RegExp(`\\b(${SIGNING_FUNCTIONS.join("|")})\\s*\\(`, "g");

/** Pause and governance entry points the bot never calls (CLAUDE.md, spec 2.2). Explicit names, no patterns. */
const FORBIDDEN_FUNCTIONS = [
  "pause()",
  "unpause()",
  "changeGovernor(address)",
  "setGovernor(address)",
  "transferGovernorship(address)",
  "transferOwnership(address)",
  "renounceOwnership()",
  "acceptOwnership()",
  "setOwner(address)",
  "changeOwner(address)",
  "upgradeTo(address)",
  "upgradeToAndCall(address,bytes)",
  "changeGuardian(address)",
  "executeGovernorProposal(address,uint256,bytes)",
];
const FORBIDDEN_NAMES = new Set(FORBIDDEN_FUNCTIONS.map((signature) => signature.slice(0, signature.indexOf("("))));
const FORBIDDEN_SELECTORS = FORBIDDEN_FUNCTIONS.map((signature) => toFunctionSelector(`function ${signature}`));

/** Function names declared by an ABI value: JSON fragments and human-readable `function name(...)` strings. */
function abiFunctionNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const names: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const match = /^\s*function\s+(\w+)/.exec(item);
      if (match) names.push(match[1]!);
    } else if (item && typeof item === "object") {
      const { type, name } = item as { type?: unknown; name?: unknown };
      if ((type === "function" || type === undefined) && typeof name === "string") names.push(name);
    }
  }
  return names;
}

/** Forbidden functions named by a module's exported ABIs. */
function forbiddenInModule(exports: Record<string, unknown>): string[] {
  return Object.entries(exports).flatMap(([exported, value]) =>
    abiFunctionNames(value)
      .filter((name) => FORBIDDEN_NAMES.has(name))
      .map((name) => `${exported}.${name}`)
  );
}

/** Forbidden calls in source text: a `functionName` literal or a hard-coded selector. */
function forbiddenInText(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(/functionName\s*:\s*["'`](\w+)["'`]/g)) {
    if (FORBIDDEN_NAMES.has(match[1]!)) found.push(`functionName ${match[1]}`);
  }
  const lower = text.toLowerCase();
  for (const selector of FORBIDDEN_SELECTORS) if (lower.includes(selector)) found.push(`selector ${selector}`);
  return found;
}

describe("source structure (L48)", () => {
  it("uses a signing API only in src/platform/executor, and only derives the address in src/platform/index.ts", () => {
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(10);
    const offenders: string[] = [];
    const seen = new Set<string>();
    for (const file of files) {
      const path = rel(file);
      for (const match of readFileSync(file, "utf8").matchAll(SIGNING_API)) {
        const api = match[1]!;
        seen.add(`${path}:${api}`);
        if (path.startsWith("platform/executor/")) continue;
        if (path === "platform/index.ts" && api === "privateKeyToAccount") continue;
        offenders.push(`${path}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
    // The scan sees the executor's own signing, so an empty result is not a scan that matched nothing.
    expect(seen).toContain("platform/executor/executor.ts:signTransaction");
  });

  it("declares and calls no pause or governance function in any ABI fragment or source file", async () => {
    // Fragments live in each lane's `abi/` directory; a tree without any passes on the source scan alone.
    const abiFiles = sourceFiles().filter((file) => rel(file).split("/").includes("abi"));
    const offenders: string[] = [];
    for (const file of abiFiles) {
      const module = (await import(file)) as Record<string, unknown>;
      for (const found of forbiddenInModule(module)) offenders.push(`${rel(file)}: ${found}`);
    }
    for (const file of sourceFiles()) {
      for (const found of forbiddenInText(readFileSync(file, "utf8"))) offenders.push(`${rel(file)}: ${found}`);
    }
    expect(offenders).toEqual([]);
  });

  it("the checker itself flags forbidden fragments, names and selectors and passes the legitimate ones", () => {
    expect(
      forbiddenInModule({
        ABI: [
          { type: "function", name: "pause", inputs: [], outputs: [], stateMutability: "nonpayable" },
          { type: "function", name: "withdrawFees", inputs: [], outputs: [], stateMutability: "nonpayable" },
          { type: "event", name: "Paused", inputs: [] },
        ],
        HUMAN: ["function transferOwnership(address)", "function updateCurrencyRate(uint256)"],
        RATE: 18,
      })
    ).toEqual(["ABI.pause", "HUMAN.transferOwnership"]);
    expect(forbiddenInText(`client.readContract({ functionName: "changeGovernor" })`)).toEqual([
      "functionName changeGovernor",
    ]);
    expect(forbiddenInText(`const data = "0x8456CB59";`)).toEqual([
      `selector ${toFunctionSelector("function pause()")}`,
    ]);
    expect(forbiddenInText(`functionName: "updateCurrencyRate", functionName: "withdrawFees"`)).toEqual([]);
  });
});
