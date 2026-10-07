import { describe, expect, it } from "vitest";
import { lifiConfigSchema } from "./config";
import { runProbe } from "./probe";
import {
  ASSETS,
  LIFI_FEE_WALLET,
  QUOTE_ROUTES,
  SIGNER,
  approvingLifiConfig,
  fixtureFetch,
  fixtureText,
  mainnetConfig,
} from "./testSupport";

async function probe(config = mainnetConfig()) {
  const lines: string[] = [];
  const fetch = fixtureFetch(QUOTE_ROUTES);
  const code = await runProbe({ config, fetch, signer: SIGNER, out: (line) => lines.push(line) });
  return { code, lines, verdicts: lines.filter((l) => l.startsWith("verdict:")), fetch };
}

describe("lifi-probe", () => {
  it("prints quote, tools, fees, minimum output and one verdict per class; exit 0 when all approved", async () => {
    const { code, lines, verdicts, fetch } = await probe();
    expect(lines.filter((l) => l.startsWith("== "))).toEqual([
      "== USDC@arc -> ETH@arbitrum: 100 USDC",
      "== ETH@base -> ETH@arbitrum: 0.05 ETH",
      "== USDC@base -> ETH@arbitrum: 100 USDC",
      "== USDC@base -> ETH@base: 100 USDC",
    ]);
    expect(verdicts).toEqual(Array(4).fill("verdict: APPROVED"));
    expect(code).toBe(0);
    expect(lines).toContain("tool: layerswap; included steps: feeCollection, layerswap");
    expect(lines.some((l) => l.startsWith("minimum output") || l.includes("minimum output: 0.03671819 ETH"))).toBe(
      true
    );
    expect(lines.some((l) => l.startsWith("fees: LIFI Fixed Fee 0.25 USDC"))).toBe(true);
    expect(lines.some((l) => l.startsWith("step approve: target 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"))).toBe(
      true
    );
    // Quote and tools only: nothing but GET /quote and /tools.
    expect(new Set(fetch.urls.map((u) => u.pathname))).toEqual(new Set(["/v1/quote", "/v1/tools"]));
  });

  it("exits non-zero when a class has no route (the recorded Arc testnet 1002 answer)", async () => {
    const base = mainnetConfig();
    // The base config is already parsed (the platform section holds bigints): spread it, do not parse it again.
    const config = {
      ...base,
      topology: {
        ...base.topology,
        pairs: [
          { ...base.topology.pairs[0]!, foreignChainId: 5042002, collectedAssets: [ASSETS.arcTestnetUsdc] },
          base.topology.pairs[1]!,
        ],
      },
    };
    const { code, verdicts, lines } = await probe(config);
    expect(verdicts).toHaveLength(4);
    expect(verdicts[0]).toMatch(/^verdict: NO ROUTE \(LI.FI 404 code 1002: No available quotes/);
    expect(verdicts.slice(1)).toEqual(Array(3).fill("verdict: APPROVED"));
    expect(code).toBe(1);
    expect(lines.at(-1)).toBe("1 route class(es) without an approved quote");
  });

  it("exits non-zero when a class's only quote is rejected by the policy, listing why", async () => {
    const config = mainnetConfig({
      allowedTools: approvingLifiConfig().allowedTools.filter((t) => t !== "okx"),
      routeClasses: [
        {
          name: "local",
          fromChainId: 8453,
          fromAsset: ASSETS.baseUsdc.address,
          toChainId: 8453,
          toAsset: "native",
          amount: "100",
        },
      ],
    });
    const { code, verdicts, lines } = await probe(config);
    expect(verdicts).toEqual(["verdict: REJECTED"]);
    expect(lines).toContain("  - tool: okx is not allowlisted");
    expect(code).toBe(1);
  });

  it("rejects every recorded route under the shipped example: its feeRecipients is empty ([L41])", async () => {
    const example = JSON.parse(fixtureText("../example-config.json"));
    expect(example.feeRecipients).toEqual([]);
    const { code, verdicts, lines } = await probe(mainnetConfig(lifiConfigSchema.parse(example)));
    expect(verdicts).toEqual(Array(4).fill("verdict: REJECTED"));
    expect(lines.filter((l) => /fee 0 pays .* not an allowed fee recipient$/.test(l))).toHaveLength(4);
    expect(code).toBe(1);
  });

  it("approves the recorded routes under the example once the operator adds the fee wallet", async () => {
    const example = JSON.parse(fixtureText("../example-config.json"));
    example.feeRecipients = [
      { chainId: 8453, address: LIFI_FEE_WALLET },
      { chainId: 5042, address: LIFI_FEE_WALLET },
    ];
    const { code, verdicts } = await probe(mainnetConfig(lifiConfigSchema.parse(example)));
    expect(verdicts).toEqual(Array(4).fill("verdict: APPROVED"));
    expect(code).toBe(0);
  });

  it("approves nothing under the default (empty) allowlists", async () => {
    const config = mainnetConfig();
    const empty = { ...config, lifi: lifiConfigSchema.parse({ nativeTokens: config.lifi.nativeTokens }) };
    const { code, verdicts } = await probe(empty);
    expect(verdicts).toEqual(Array(4).fill("verdict: REJECTED"));
    expect(code).toBe(1);
  });
});
