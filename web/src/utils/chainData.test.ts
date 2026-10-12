import { encodeAbiParameters, encodeEventTopics, maxUint256, parseEther, type Log } from "viem";
import { describe, it, expect } from "vitest";

import { DEFAULT_CHAIN } from "consts/chains";
import { klerosCoreAbi, klerosCoreAddress } from "hooks/contracts/generated";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { prepareArbitratorExtradata } from "src/dispute-kits/prepareArbitratorExtradata";
import { aTemplateAnswer } from "src/test/builders";

import { extraDataToTokenInfo } from "./extradataToTokenInfo";
import { getVoteChoice } from "./getVoteChoice";
import { isLastRound } from "./isLastRound";
import { retrieveDisputeIdFromLogs } from "./retrieveDisputeId";

const TOKEN = "0x00000000000000000000000000000000000000aa";

describe("isLastRound", () => {
  it("is false for an unknown or ordinary appeal cost", () => {
    expect(isLastRound(undefined)).toBe(false);
    expect(isLastRound(parseEther("0.5"))).toBe(false);
  });

  it("is true for KlerosCore's NON_PAYABLE_AMOUNT, returned when no further appeal is possible", () => {
    expect(isLastRound((maxUint256 - 1n) / 2n)).toBe(true);
  });
});

describe("extraDataToTokenInfo", () => {
  it("is undefined for classic extra data (3 words)", () => {
    expect(extraDataToTokenInfo(prepareArbitratorExtradata("1", 3, DisputeKits.Classic, undefined))).toBeUndefined();
  });

  it.each([
    { isERC1155: false, tokenId: "0" },
    { isERC1155: true, tokenId: "42" },
  ])("decodes what the gated encoder wrote (ERC-1155: $isERC1155)", ({ isERC1155, tokenId }) => {
    const extraData = prepareArbitratorExtradata("2", 5, DisputeKits.Gated, {
      isValid: true,
      tokenGate: TOKEN,
      isERC1155,
      tokenId,
    });
    expect(extraDataToTokenInfo(extraData)).toEqual({ tokenGate: TOKEN, isERC1155, tokenId });
  });

  it("ignores the token id of an ERC-20 gate, as the encoder zeroes it", () => {
    const extraData = prepareArbitratorExtradata("2", 5, DisputeKits.GatedShutter, {
      isValid: true,
      tokenGate: TOKEN,
      isERC1155: false,
      tokenId: "7",
    });
    expect(extraDataToTokenInfo(extraData)?.tokenId).toBe("0");
  });
});

describe("retrieveDisputeIdFromLogs", () => {
  const core = klerosCoreAddress[DEFAULT_CHAIN.id];
  const arbitrable = "0x00000000000000000000000000000000000000a1";
  const disputeCreationLog = (address: `0x${string}`, disputeId: bigint) =>
    ({
      address,
      topics: encodeEventTopics({
        abi: klerosCoreAbi,
        eventName: "DisputeCreation",
        args: { _disputeID: disputeId, _arbitrable: arbitrable },
      }),
      data: "0x",
    }) as unknown as Log;

  it("reads the dispute id from KlerosCore's DisputeCreation event", () => {
    const transfer = {
      address: core,
      topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
      data: encodeAbiParameters([{ type: "uint256" }], [1n]),
    } as unknown as Log;
    expect(retrieveDisputeIdFromLogs([transfer, disputeCreationLog(core, 77n)])).toBe(77n);
  });

  it("matches the core address case-insensitively", () => {
    expect(retrieveDisputeIdFromLogs([disputeCreationLog(core.toLowerCase() as `0x${string}`, 5n)])).toBe(5n);
  });

  it("ignores the same event from another contract and returns undefined", () => {
    const other = "0x00000000000000000000000000000000000000d1";
    expect(retrieveDisputeIdFromLogs([disputeCreationLog(other, 9n)])).toBeUndefined();
    expect(retrieveDisputeIdFromLogs([disputeCreationLog(other, 9n)], other)).toBe(9n);
  });
});

describe("getVoteChoice", () => {
  const answers = [aTemplateAnswer({ id: "0x1", title: "Yes" }), aTemplateAnswer({ id: "0xa", title: "Ten" })];

  it("maps the decimal vote to the template answer with the matching hex id", () => {
    expect(getVoteChoice("1", answers)).toBe("Yes");
    expect(getVoteChoice("10", answers)).toBe("Ten");
  });

  it("labels choice 0 as Refuse to Arbitrate when the template has no 0x0 answer", () => {
    expect(getVoteChoice("0", answers)).toBe("Refuse to Arbitrate / Invalid");
  });

  it("falls back to a generic label for a choice the template does not list", () => {
    expect(getVoteChoice("3", answers)).toBe("Answer 0x3");
  });

  it.fails("KNOWN BUG: fallback label prefixes 0x to the decimal choice, so choice 11 reads as 0x11", () => {
    expect(getVoteChoice("11", answers)).toBe("Answer 0xb");
  });
});
