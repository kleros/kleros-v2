import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { sdkDistDirectory } from "./sdk";

const here = dirname(fileURLToPath(import.meta.url));
const botRoot = join(here, "..", "..");
const work = mkdtempSync(join(tmpdir(), "mainnet-no-ethers-"));
afterAll(() => rmSync(work, { recursive: true, force: true }));

/**
 * Makes `ethers` unresolvable in a child process, for CommonJS `require` (the SDK's own loader:
 * `Module._resolveFilename`) and for ESM `import` (`module.registerHooks`), whoever asks for it.
 */
const BLOCK_ETHERS = `
const Module = require("node:module");
const blocked = (specifier) => specifier === "ethers" || specifier.startsWith("ethers/");
const notFound = (specifier, code) =>
  Object.assign(new Error("Cannot find module '" + specifier + "' (made unresolvable by the [L6] test)"), { code });
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (blocked(request)) throw notFound(request, "MODULE_NOT_FOUND");
  return resolveFilename.call(this, request, ...rest);
};
Module.registerHooks({
  resolve(specifier, context, nextResolve) {
    if (blocked(specifier)) throw notFound(specifier, "ERR_MODULE_NOT_FOUND");
    return nextResolve(specifier, context);
  },
});
`;

/** Probes that `ethers` is really gone (from the generator's own directory), then resolves the six reporters. */
const PROBE = `
import { createRequire } from "node:module";
const generator = ${JSON.stringify(pathToFileURL(join(here, "generate.ts")).href)};
const fromBot = createRequire(${JSON.stringify(join(here, "generate.ts"))});
const outcome = (fn) => { try { fn(); return "resolved"; } catch (error) { return String(error.code); } };
const probes = {
  requireEthers: outcome(() => fromBot("ethers")),
  requireSdkRoot: outcome(() => fromBot("@kleros/veashi-sdk")),
};
try {
  await import("ethers");
  probes.importEthers = "resolved";
} catch (error) {
  probes.importEthers = String(error.code);
}
const { expectedRoutes } = await import(generator);
const routes = expectedRoutes().map(({ id, chainId, reporter }) => ({ id, chainId, reporter }));
const loaded = Object.keys(fromBot.cache).filter((path) => /[\\\\/]node_modules[\\\\/]ethers[\\\\/]/.test(path));
console.log(JSON.stringify({ probes, routes, loaded }));
`;

describe("@kleros/veashi-sdk without ethers ([L6])", () => {
  it("ethers is resolvable from the bot without the hook, so the hook is what removes it", () => {
    expect(() => createRequire(join(here, "generate.ts")).resolve("ethers")).not.toThrow();
  });

  it("resolves all six reporter addresses with ethers unresolvable, through the SDK's CommonJS loader too", () => {
    const block = join(work, "block-ethers.cjs");
    const probe = join(work, "probe.mts");
    writeFileSync(block, BLOCK_ETHERS);
    writeFileSync(probe, PROBE);
    const child = spawnSync(process.execPath, ["--require", block, "--import", "tsx", probe], {
      cwd: botRoot,
      encoding: "utf8",
      env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "" },
      timeout: 60_000,
    });
    expect(child.status, child.stderr).toBe(0);
    const result = JSON.parse(child.stdout.trim().split("\n").pop()!);

    // The hook works: ethers cannot be required or imported, and the SDK's root entry fails on it.
    // (On Node >= 23.5 `require` goes through the registered hook first, hence either code.)
    expect(Object.keys(result.probes).sort()).toEqual(["importEthers", "requireEthers", "requireSdkRoot"]);
    for (const [probe, code] of Object.entries(result.probes)) expect(code, probe).toMatch(/^(ERR_)?MODULE_NOT_FOUND$/);
    expect(result.loaded).toEqual([]);

    const route = (source: number, destination: number) =>
      JSON.parse(readFileSync(join(sdkDistDirectory(), "addresses", `${source}-${destination}.json`), "utf8"));
    const [b2a, a2b] = [route(8453, 42161), route(42161, 8453)];
    expect(result.routes).toEqual([
      { id: "base->arbitrum:ccip", chainId: 8453, reporter: b2a.ccipReporter },
      { id: "base->arbitrum:lz", chainId: 8453, reporter: b2a.lzReporter },
      { id: "base->arbitrum:axelar", chainId: 8453, reporter: b2a.axelarReporter },
      { id: "arbitrum->base:ccip", chainId: 42161, reporter: a2b.ccipReporter },
      { id: "arbitrum->base:lz", chainId: 42161, reporter: a2b.lzReporter },
      { id: "arbitrum->base:axelar", chainId: 42161, reporter: a2b.axelarReporter },
    ]);
  });
});
