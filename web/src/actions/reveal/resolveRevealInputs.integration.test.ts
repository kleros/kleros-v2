import { privateKeyToAccount } from "viem/accounts";
import { describe, it, expect } from "vitest";

import type { Answer } from "@kleros/kleros-sdk";

import { generateSalt } from "utils/crypto/generateSalt";
import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/consts";

import { getVoteKey } from "../helpers/storage/key";

import type { ResolveRevealContext } from "./params";
import { resolveRevealInputs } from "./resolveRevealInputs";

describe("resolveRevealInputs (integration)", () => {
  const params = {
    disputeId: 1n,
    roundIndex: 0,
    voteIds: [0n],
    type: DisputeKits.Classic,
  };
  it("reconstructs choice and salt end-to-end using real crypto", async () => {
    const account = privateKeyToAccount("0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");

    const answers: Answer[] = [
      { id: "0x1", title: "A", description: "" },
      { id: "0x2", title: "B", description: "" },
    ];

    const key = getVoteKey(params.disputeId, params.roundIndex, params.voteIds);

    const salt = await generateSalt(account, key);

    const commit = hashVote(2n, BigInt(salt));

    const context: ResolveRevealContext = {
      signingAccount: account,
      answers,
      commit,
    };

    const result = await resolveRevealInputs(params, context);

    expect(result.choice).toBe(2n);
    expect(result.salt).toBe(BigInt(salt));
  });
});
