import { arbitrum, arbitrumSepolia, hardhat, mainnet } from "viem/chains";
import { describe, it, expect, vi } from "vitest";

import { TEST_URLS } from "src/test/env";

import { getGraphqlUrl } from "./getGraphqlUrl";

describe("getGraphqlUrl", () => {
  it("returns the core subgraph by default, whatever the chain", () => {
    expect(getGraphqlUrl()).toBe(TEST_URLS.coreSubgraph);
    expect(getGraphqlUrl(false, arbitrum.id)).toBe(TEST_URLS.coreSubgraph);
  });

  it("returns the dispute template subgraph of the default chain (Arbitrum Sepolia on devnet)", () => {
    expect(getGraphqlUrl(true)).toBe(TEST_URLS.drtSubgraph);
  });

  it.each([
    { chainId: arbitrum.id, variable: "REACT_APP_DRT_ARBMAINNET_SUBGRAPH" },
    { chainId: hardhat.id, variable: "REACT_APP_DRT_LOCAL_SUBGRAPH" },
    { chainId: arbitrumSepolia.id, variable: "REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH" },
  ])("picks $variable for chain $chainId", ({ chainId, variable }) => {
    vi.stubEnv(variable, `http://drt.test/${chainId}`);
    expect(getGraphqlUrl(true, chainId)).toBe(`http://drt.test/${chainId}`);
  });

  it("names the missing variable instead of returning undefined", () => {
    vi.stubEnv("REACT_APP_CORE_SUBGRAPH", undefined);
    expect(getGraphqlUrl()).toBe("Environment variables REACT_APP_CORE_SUBGRAPH not set.");
    expect(getGraphqlUrl(true, arbitrum.id)).toBe("Environment variable REACT_APP_DRT_ARBMAINNET_SUBGRAPH not set.");
  });

  it("returns undefined for a chain with no template subgraph", () => {
    expect(getGraphqlUrl(true, mainnet.id)).toBeUndefined();
  });
});
