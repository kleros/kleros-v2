import { concat, encodeAbiParameters, encodePacked, maxUint256 } from "viem";
import { describe, expect, it } from "vitest";

import { DisputeKits } from "./disputeKits";
import {
  isValidTokenId,
  prepareArbitratorExtradata,
  tryPrepareArbitratorExtradata,
  type GatedDisputeKitData,
} from "./prepareArbitratorExtradata";

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

describe("isValidTokenId", () => {
  it.each(["", "0", "42", maxUint256.toString()])("accepts %j", (tokenId) => {
    expect(isValidTokenId(tokenId)).toBe(true);
  });

  // what the token ID field stored for ".", ".5" and "1.5" before it read onValueChange
  it.each(["NaN", "0.5", "1.5", "-1", "1e3", " 1"])("rejects %j", (tokenId) => {
    expect(isValidTokenId(tokenId)).toBe(false);
  });
});

describe("tryPrepareArbitratorExtradata", () => {
  const gatedData = (tokenId: string): GatedDisputeKitData => ({
    tokenGate: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    isERC1155: true,
    tokenId,
    isValid: true,
  });

  it("encodes what prepareArbitratorExtradata encodes", () => {
    expect(tryPrepareArbitratorExtradata(COURT_ID, NB_VOTES, DisputeKits.Gated, gatedData("7"))).toBe(
      prepareArbitratorExtradata(COURT_ID, NB_VOTES, DisputeKits.Gated, gatedData("7"))
    );
  });

  it.each(["NaN", "1.5"])("returns undefined where prepareArbitratorExtradata throws, for token ID %j", (tokenId) => {
    expect(() => prepareArbitratorExtradata(COURT_ID, NB_VOTES, DisputeKits.Gated, gatedData(tokenId))).toThrow();
    expect(tryPrepareArbitratorExtradata(COURT_ID, NB_VOTES, DisputeKits.Gated, gatedData(tokenId))).toBeUndefined();
  });
});
