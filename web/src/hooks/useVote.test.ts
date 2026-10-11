import { act, waitFor } from "@testing-library/react";
import { decodeFunctionData, getAddress } from "viem";
import { describe, it, expect, vi } from "vitest";
import { useAccount } from "wagmi";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { DISPUTE_KIT_REGISTRY } from "src/dispute-kits/registry";
import { renderHookWithProviders } from "src/test/renderWithProviders";

import { useVote } from "./useVote";

vi.mock("react-toastify", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

describe("useVote", () => {
  it("casts an open vote on the dispute's kit and refreshes the juror's draws", async () => {
    const kit = DISPUTE_KIT_REGISTRY[DisputeKits.Gated];
    const onSuccess = vi.fn();
    const { result, sentTransactions, queryClient } = renderHookWithProviders(() => ({
      vote: useVote(onSuccess),
      account: useAccount(),
    }));
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));

    await act(async () => {
      await result.current.vote.mutateAsync({
        disputeId: 5n,
        voteIds: [0n, 1n],
        choice: 1n,
        salt: 0n,
        justification: "evidence is clear",
        disputeKitId: DisputeKits.Gated,
      });
    });

    expect(getAddress(sentTransactions[0].to)).toBe(getAddress(kit.address));
    expect(decodeFunctionData({ abi: kit.disputeKitAbi, data: sentTransactions[0].data! })).toMatchObject({
      functionName: "castVote",
      args: [5n, [0n, 1n], 1n, 0n, "evidence is clear"],
    });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["useDrawQuery"] });
  });
});
