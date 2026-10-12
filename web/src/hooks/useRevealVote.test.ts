import { act, waitFor } from "@testing-library/react";
import { decodeFunctionData, getAddress, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, it, expect, vi } from "vitest";
import { useAccount } from "wagmi";

import { getVoteKey } from "actions/helpers/storage/getVoteKey";
import type { ResolveRevealParams } from "actions/reveal/params";

import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { DISPUTE_KIT_REGISTRY } from "src/dispute-kits/registry";
import { aTemplateAnswer } from "src/test/builders";
import { MOCK_ACCOUNT_1 } from "src/test/mocks";
import { MOCK_TYPED_DATA_SIGNATURE } from "src/test/msw/rpc";
import { renderHookWithProviders } from "src/test/renderWithProviders";

import { useRevealVote } from "./useRevealVote";

vi.mock("react-toastify", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

const kit = DISPUTE_KIT_REGISTRY[DisputeKits.Classic];
const voteKey = getVoteKey(12n, 1, [3n]);
const params: ResolveRevealParams = { disputeId: 12n, voteIds: [3n], roundIndex: 1, disputeKitId: DisputeKits.Classic };

const renderReveal = (receiptStatus: "success" | "reverted" = "success") =>
  renderHookWithProviders(() => ({ reveal: useRevealVote(), account: useAccount() }), { receiptStatus });

const revealedArgs = (data: `0x${string}`) => decodeFunctionData({ abi: kit.disputeKitAbi, data });

describe("useRevealVote", () => {
  it("reveals the stored choice and salt, then forgets them once mined", async () => {
    localStorage.setItem(voteKey, JSON.stringify({ choice: "2", salt: "777", justification: "late parcel" }));
    const { result, sentTransactions } = renderReveal();
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));

    await act(async () => {
      await result.current.reveal.mutateAsync({ params, context: {} });
    });

    expect(getAddress(sentTransactions[0].to)).toBe(getAddress(kit.address));
    expect(revealedArgs(sentTransactions[0].data!)).toMatchObject({
      functionName: "castVote",
      args: [12n, [3n], 2n, 777n, "late parcel"],
    });
    expect(localStorage.getItem(voteKey)).toBeNull();
  });

  it("keeps the stored commit data when the reveal reverts", async () => {
    localStorage.setItem(voteKey, JSON.stringify({ choice: "2", salt: "777" }));
    const { result } = renderReveal("reverted");
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));

    await act(async () => {
      await result.current.reveal.mutateAsync({ params, context: {} });
    });

    expect(localStorage.getItem(voteKey)).not.toBeNull();
  });

  it("recovers the choice from the on-chain commit when local data is gone", async () => {
    const signingKey = keccak256(MOCK_TYPED_DATA_SIGNATURE);
    const salt = BigInt(keccak256(await privateKeyToAccount(signingKey).signMessage({ message: voteKey })));
    const answers = ["0x1", "0x2", "0x3"].map((id) => aTemplateAnswer({ id }));
    const { result, sentTransactions } = renderReveal();
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));

    await act(async () => {
      await result.current.reveal.mutateAsync({
        params: { ...params, justification: "recovered" },
        context: { commit: hashVote(3n, salt), answers },
      });
    });

    expect(revealedArgs(sentTransactions[0].data!).args).toEqual([12n, [3n], 3n, salt, "recovered"]);
    expect(JSON.parse(localStorage.getItem(`signingAccount-${getAddress(MOCK_ACCOUNT_1)}`)!)).toBe(signingKey);
  });
});
