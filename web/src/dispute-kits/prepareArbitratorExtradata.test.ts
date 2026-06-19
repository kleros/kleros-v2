import { concat, encodeAbiParameters, encodePacked } from "viem";
import { describe, expect, it } from "vitest";

import { DisputeKits } from "./disputeKits";
import { prepareArbitratorExtradata, type GatedDisputeKitData } from "./prepareArbitratorExtradata";

const encodeExpectedClassicExtraData = (courtId: string, noOfVotes: number, disputeKit: DisputeKits) =>
  encodeAbiParameters(
    [{ type: "uint256" }, { type: "uint256" }, { type: "uint256" }],
    [BigInt(courtId), BigInt(noOfVotes), BigInt(disputeKit)]
  );

const encodeExpectedGatedExtraData = (
  courtId: string,
  noOfVotes: number,
  disputeKit: DisputeKits,
  gatedData: GatedDisputeKitData
) => {
  const base = encodeExpectedClassicExtraData(courtId, noOfVotes, disputeKit);

  const tokenId = !gatedData.tokenId || !gatedData.isERC1155 ? "0" : gatedData.tokenId;
  const packed = encodePacked(["uint88", "bool", "address"], [0n, gatedData.isERC1155, gatedData.tokenGate]);
  const gated = encodeAbiParameters([{ type: "bytes32" }, { type: "uint256" }], [packed, BigInt(tokenId)]);

  return concat([base, gated]);
};

const COURT_ID = "1";
const NB_VOTES = 3;

describe("prepareArbitratorExtradata", () => {
  it("encodes base extraData when no dispute kit data is provided", () => {
    const result = prepareArbitratorExtradata(COURT_ID, NB_VOTES, DisputeKits.Classic, undefined);
    expect(result).toBe(encodeExpectedClassicExtraData(COURT_ID, NB_VOTES, DisputeKits.Classic));
  });

  it("encodes gated ERC20 dispute kit data", () => {
    const gatedData: GatedDisputeKitData = {
      tokenGate: "0x1234567890123456789012345678901234567890",
      isERC1155: false,
      tokenId: "42",
      isValid: true,
    };

    const result = prepareArbitratorExtradata(COURT_ID, NB_VOTES, DisputeKits.Gated, gatedData);

    expect(result).toBe(encodeExpectedGatedExtraData(COURT_ID, NB_VOTES, DisputeKits.Gated, gatedData));
  });

  it("encodes gated ERC1155 dispute kit data", () => {
    const gatedData: GatedDisputeKitData = {
      tokenGate: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      isERC1155: true,
      tokenId: "7",
      isValid: true,
    };

    const result = prepareArbitratorExtradata(COURT_ID, NB_VOTES, DisputeKits.GatedShutter, gatedData);

    expect(result).toBe(encodeExpectedGatedExtraData(COURT_ID, NB_VOTES, DisputeKits.GatedShutter, gatedData));
  });

  it("ignores dispute kit data when the kit has no encoder", () => {
    const gatedData: GatedDisputeKitData = {
      tokenGate: "0x1234567890123456789012345678901234567890",
      isERC1155: false,
      tokenId: "0",
      isValid: true,
    };

    const result = prepareArbitratorExtradata(COURT_ID, NB_VOTES, DisputeKits.Classic, gatedData);

    expect(result).toBe(encodeExpectedClassicExtraData(COURT_ID, NB_VOTES, DisputeKits.Classic));
  });
});
