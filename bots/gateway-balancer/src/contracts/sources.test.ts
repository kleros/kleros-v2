import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { hashContractSources } from "../../scripts/contractSources.mjs";
import { CONTRACT_SOURCES_HASH } from "./abi";
import bytecode from "./bytecode.json";

const contractsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../contracts");

describe("exported contract artifacts", () => {
  it("match the current Solidity sources", () => {
    // On failure: `yarn workspace @kleros/kleros-v2-contracts build`, then
    // `yarn workspace @kleros/gateway-balancer-bot export-contracts`, and commit src/contracts.
    expect(hashContractSources(contractsDir)).toBe(CONTRACT_SOURCES_HASH);
    expect(bytecode.sourceHash).toBe(CONTRACT_SOURCES_HASH);
  });
});
