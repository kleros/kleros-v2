// The Solidity sources the exported ABIs and bytecode depend on, hashed so a test can tell when they changed.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/** Directories and files under contracts/ whose changes require a new export. */
export const CONTRACT_SOURCES = ["src/gateway", "src/proxy", "src/libraries", "src/token/TestERC20.sol"];

function listFiles(target) {
  if (!statSync(target).isDirectory()) return [target];
  return readdirSync(target)
    .sort()
    .flatMap((entry) => listFiles(path.join(target, entry)));
}

export function hashContractSources(contractsDir) {
  const hash = createHash("sha256");
  for (const source of CONTRACT_SOURCES) {
    for (const file of listFiles(path.join(contractsDir, source)).filter((f) => f.endsWith(".sol"))) {
      hash.update(path.relative(contractsDir, file));
      hash.update("\0");
      hash.update(readFileSync(file));
      hash.update("\0");
    }
  }
  return hash.digest("hex");
}
