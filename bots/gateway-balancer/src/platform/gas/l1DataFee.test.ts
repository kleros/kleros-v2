import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chargesL1DataFee } from "./l1DataFee";

/**
 * Whether each chain charges an L1 data fee (OP-stack), decided by hand. `OP_STACK_CHAIN_IDS` is a literal set, so a
 * chain added to the shipped topology must be classified here first: an OP-stack chain missing from the set would get
 * no L1 data fee in the gas reserve (review finding F5).
 */
const CLASSIFIED: Record<number, boolean> = {
  42161: false, // Arbitrum One: the L1 cost is folded into the gas limit
  421614: false, // Arbitrum Sepolia
  8453: true, // Base
  84532: true, // Base Sepolia
  5042002: false, // Arc: an L1
};

describe("L1 data fee chains", () => {
  it("classifies every chain of the shipped topology, and the list agrees", () => {
    const example = JSON.parse(readFileSync(new URL("../../../config/example.json", import.meta.url), "utf8")) as {
      topology: { chains: { id: number; name: string }[] };
    };
    const chains = example.topology.chains;
    expect(chains.length).toBeGreaterThan(0);
    for (const chain of chains) {
      expect(CLASSIFIED, `classify ${chain.name} (${chain.id}) here and in OP_STACK_CHAIN_IDS`).toHaveProperty(
        String(chain.id)
      );
      expect(chargesL1DataFee(chain.id), `${chain.name} (${chain.id})`).toBe(CLASSIFIED[chain.id]);
    }
  });

  it("agrees with the classification for every chain listed here", () => {
    for (const [id, charges] of Object.entries(CLASSIFIED)) expect(chargesL1DataFee(Number(id)), id).toBe(charges);
  });
});
