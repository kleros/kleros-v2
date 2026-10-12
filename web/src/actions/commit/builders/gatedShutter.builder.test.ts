import { arbitrumSepolia } from "viem/chains";
import { describe, it, expect, vi } from "vitest";

import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import { hashJustification } from "utils/crypto/hashJustification";
import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { fakeEncrypt, verifyFakeEncryptOutput } from "src/test/fakes/shutter";
import { MOCK_ACCOUNT_1, MOCK_GATED_SHUTTER_DK_ADDRESS, mockContractsGenerated } from "src/test/mocks";

import type { CommitContext } from "../context";
import { encodeShutterMessage } from "../helpers";
import type { GatedShutterCommitParams } from "../params";

import { gatedShutterCommitBuilder } from "./gatedShutter.builder";

vi.mock("hooks/contracts/generated", () => mockContractsGenerated);

const context: CommitContext = {
  account: MOCK_ACCOUNT_1,
  chain: arbitrumSepolia,
  walletClient: {} as CommitContext["walletClient"],
};

const createParams = (overrides: Partial<GatedShutterCommitParams> = {}): GatedShutterCommitParams => ({
  disputeId: 4n,
  voteIds: [0n, 1n],
  choice: 2n,
  salt: 999n,
  roundIndex: 1,
  decryptionDelay: 300,
  justification: "token holders agree",
  disputeKitId: DisputeKits.GatedShutter,
  ...overrides,
});

describe("gatedShutterCommitBuilder", () => {
  const storeCommitData = vi.fn();
  const encrypt = vi.fn(fakeEncrypt);
  const build = (params: GatedShutterCommitParams) =>
    gatedShutterCommitBuilder.build(params, context, { storeCommitData, encrypt });

  it("calls castCommitShutter on the gated shutter kit with both commitments and the shutter payload", async () => {
    const params = createParams();

    const txn = await build(params);

    expect(txn).toMatchObject({
      account: MOCK_ACCOUNT_1,
      address: MOCK_GATED_SHUTTER_DK_ADDRESS,
      functionName: "castCommitShutter",
      chain: arbitrumSepolia,
    });
    const [disputeId, voteIds, choiceCommit, justificationCommit, identity, encrypted] = txn.args;
    expect([disputeId, voteIds]).toEqual([4n, [0n, 1n]]);
    expect(choiceCommit).toBe(hashVote(2n, 999n));
    expect(justificationCommit).toBe(hashJustification(999n, "token holders agree"));
    expect(
      verifyFakeEncryptOutput(encodeShutterMessage(2n, 999n, "token holders agree"), 300, identity, encrypted)
    ).toBe(true);
  });

  it("encrypts the encoded message with the requested decryption delay", async () => {
    await build(createParams({ decryptionDelay: 60 }));

    expect(encrypt).toHaveBeenCalledWith(encodeShutterMessage(2n, 999n, "token holders agree"), 60);
  });

  it("stores choice, salt and justification before encrypting", async () => {
    await build(createParams());

    expect(storeCommitData).toHaveBeenCalledWith(getVoteKey(4n, 1, [0n, 1n]), {
      choice: 2n,
      salt: 999n,
      justification: "token holders agree",
    });
    expect(storeCommitData.mock.invocationCallOrder[0]).toBeLessThan(encrypt.mock.invocationCallOrder[0]);
  });

  it.each(["", "   "])("refuses to build when REACT_APP_SHUTTER_API is %j", async (value) => {
    vi.stubEnv("REACT_APP_SHUTTER_API", value);
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(build(createParams())).rejects.toThrow("REACT_APP_SHUTTER_API environment variable is required");
    expect(storeCommitData).not.toHaveBeenCalled();
    expect(encrypt).not.toHaveBeenCalled();
  });
});
