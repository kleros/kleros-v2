import { describe, expect, it } from "vitest";
import { parseAbiItem } from "viem";
import { callAction } from "../../src/dataMappings/actions/callAction";
import { AbiCallMapping } from "../../src/dataMappings/utils/actionTypes";
import { mockChain } from "../helpers/rpc";

const CORE = "0xA54e7A16d7460e38a8F324eF46782FB520d58CE8";
const CURRENT_RULING =
  "function currentRuling(uint256 _disputeID) view returns (uint256 ruling, bool tied, bool overridden)";

const mapping = (overrides: Partial<AbiCallMapping> = {}): AbiCallMapping => ({
  type: "abi/call",
  abi: CURRENT_RULING,
  address: CORE,
  functionName: "currentRuling",
  args: ["7"],
  seek: ["0", "1", "2"],
  populate: ["ruling", "tied", "overridden"],
  ...overrides,
});

describe("callAction", () => {
  it("decodes a tuple return and maps it by index", async () => {
    const seenArgs: unknown[] = [];
    mockChain({
      reads: [
        {
          address: CORE,
          abi: CURRENT_RULING,
          result: (args) => {
            seenArgs.push(...args);
            return [2n, true, false];
          },
        },
      ],
    });

    const result = await callAction(mapping());

    expect(seenArgs).toEqual([7n]);
    expect(result).toEqual({ ruling: 2n, tied: true, overridden: false });
  });

  it("wraps a single scalar return as { value }", async () => {
    const abi = "function arbitrationCost(bytes _extraData) view returns (uint256 cost)";
    mockChain({ reads: [{ address: CORE, abi, result: () => 10n ** 16n }] });

    const result = await callAction(
      mapping({ abi, functionName: "arbitrationCost", args: ["0x"], seek: ["value"], populate: ["cost"] })
    );

    expect(result).toEqual({ cost: 10n ** 16n });
  });

  it("wraps a string return as { value }", async () => {
    const abi = "function name() view returns (string)";
    mockChain({ reads: [{ address: CORE, abi, result: () => "Kleros" }] });

    const result = await callAction(mapping({ abi, functionName: "name", args: [], seek: ["value"], populate: ["n"] }));

    expect(result).toEqual({ n: "Kleros" });
  });

  it("accepts an already parsed ABI item", async () => {
    mockChain({ reads: [{ address: CORE, abi: CURRENT_RULING, result: () => [1n, false, false] }] });

    const result = await callAction(mapping({ abi: parseAbiItem(CURRENT_RULING) as unknown as string }));

    expect(result).toEqual({ ruling: 1n, tied: false, overridden: false });
  });

  it("rejects when the RPC call fails", async () => {
    mockChain({ reads: [] });

    await expect(callAction(mapping())).rejects.toThrow(/unmocked eth_call/);
  });
});
