import { describe, expect, it } from "vitest";
import { exampleConfig, exampleTopology } from "../testing/ports";
import { appConfigSchema, topologySchema } from "./schema";
import { validateTopology } from "./validate";

describe("configuration", () => {
  it("accepts the example topology and applies defaults", () => {
    const config = exampleConfig();
    expect(validateTopology(config.topology)).toEqual([]);
    expect(config.topology.chains[0]?.confirmations).toBe(3);
    expect(config.topology.chains[1]?.nativeDecimals).toBe(18);
  });

  it("names every broken cross-reference", () => {
    const topology = topologySchema.parse(exampleTopology());
    topology.pairs[0]!.homeChainId = 9999;
    topology.routes[0]!.pairId = "missing";
    topology.routes[1]!.chainId = 1002;
    topology.routes.push({ ...topology.routes[2]! });
    const problems = validateTopology(topology);
    expect(problems).toContain("pair usdc-home: unknown home chain 9999");
    expect(problems).toContain("route usdc-home->home: unknown pair missing");
    expect(problems).toContain("route home->usdc-home: chain 1002 is neither side of pair usdc-home");
    expect(problems).toContain("duplicate route id eth-home->home");
  });

  it("rejects a malformed address with its path", () => {
    const input = exampleTopology();
    input.pairs[0]!.foreignGateway = "0x123" as never;
    const result = appConfigSchema.safeParse({ topology: input });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["topology", "pairs", 0, "foreignGateway"]);
    }
  });
});
