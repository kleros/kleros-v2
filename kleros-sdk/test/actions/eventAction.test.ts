import { describe, expect, it } from "vitest";
import { eventAction } from "../../src/dataMappings/actions/eventAction";
import { AbiEventMapping } from "../../src/dataMappings/utils/actionTypes";
import { mockChain } from "../helpers/rpc";

const TOKEN = "0xa8e4235129258404A2ed3D36DAd20708CcB2d0b7";
const OTHER = "0x0000000000000000000000000000000000000001";
const ALICE = "0x1234567890123456789012345678901234567890";
const BOB = "0x0987654321098765432109876543210987654321";
const TRANSFER = "event Transfer(address indexed from, address indexed to, uint256 value)";

const mapping = (overrides: Partial<AbiEventMapping> = {}): AbiEventMapping => ({
  type: "abi/event",
  abi: TRANSFER,
  address: TOKEN,
  eventFilter: { fromBlock: "earliest", toBlock: "latest", args: [] },
  seek: ["from", "to", "value"],
  populate: ["fromAddress", "toAddress", "transferValue"],
  ...overrides,
});

describe("eventAction", () => {
  it("decodes the first matching log and maps its args", async () => {
    mockChain({
      logs: [
        { address: TOKEN, event: TRANSFER, args: { from: ALICE, to: BOB, value: 100n } },
        { address: TOKEN, event: TRANSFER, args: { from: BOB, to: ALICE, value: 5n } },
      ],
    });

    const result = await eventAction(mapping());

    expect(result).toEqual({ fromAddress: ALICE, toAddress: BOB, transferValue: 100n });
  });

  it("filters by indexed args and contract address", async () => {
    mockChain({
      logs: [
        { address: OTHER, event: TRANSFER, args: { from: BOB, to: ALICE, value: 1n } },
        { address: TOKEN, event: TRANSFER, args: { from: ALICE, to: ALICE, value: 2n } },
        { address: TOKEN, event: TRANSFER, args: { from: BOB, to: ALICE, value: 3n } },
      ],
    });

    const result = await eventAction(mapping({ eventFilter: { fromBlock: 0n, toBlock: "latest", args: [BOB] } }));

    expect(result).toEqual({ fromAddress: BOB, toAddress: ALICE, transferValue: 3n });
  });

  it("passes the mapping's block range to the node", async () => {
    const chain = mockChain({ logs: [{ address: TOKEN, event: TRANSFER, args: { from: ALICE, to: BOB, value: 1n } }] });

    await eventAction(mapping({ eventFilter: { fromBlock: 123n, toBlock: "latest", args: [] } }));

    expect(chain.filters()[0]).toMatchObject({ fromBlock: "0x7b", toBlock: "latest" });
  });

  // issue: 2026-10-09-kleros-v2-dev-mapping-timeouts-caps
  it.fails("KNOWN BUG: zero matching logs fails with an SDK error, not a TypeError", async () => {
    mockChain({ logs: [] });

    const outcome = await eventAction(mapping()).catch((error: unknown) => error);

    expect(outcome).not.toBeInstanceOf(TypeError);
  });
});
