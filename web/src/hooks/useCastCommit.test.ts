import { act, waitFor } from "@testing-library/react";
import { decodeFunctionData, getAddress, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, it, expect, vi } from "vitest";
import { useAccount } from "wagmi";

import type { ClassicCommitParams } from "actions/commit/params";
import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import { hashVote } from "utils/crypto/hashVote";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { DISPUTE_KIT_REGISTRY } from "src/dispute-kits/registry";
import { MOCK_ACCOUNT_1 } from "src/test/mocks";
import { MOCK_TYPED_DATA_SIGNATURE } from "src/test/msw/rpc";
import { renderHookWithProviders } from "src/test/renderWithProviders";

import { useCastCommit } from "./useCastCommit";

vi.mock("react-toastify", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

const SIGNING_KEY = keccak256(MOCK_TYPED_DATA_SIGNATURE);
const signingKeyStorage = `signingAccount-${getAddress(MOCK_ACCOUNT_1)}`;

const commitParams: Omit<ClassicCommitParams, "salt"> = {
  disputeId: 12n,
  voteIds: [3n, 4n],
  choice: 2n,
  roundIndex: 1,
  disputeKitId: DisputeKits.Classic,
};

const renderCastCommit = () =>
  renderHookWithProviders(() => ({ commit: useCastCommit(), account: useAccount() }), {
    route: "/cases/12/voting",
  });

const expectedSalt = async () =>
  BigInt(keccak256(await privateKeyToAccount(SIGNING_KEY).signMessage({ message: getVoteKey(12n, 1, [3n, 4n]) })));

describe("useCastCommit", () => {
  it("derives a signing key from the wallet once, then commits hashVote(choice, salt) on chain", async () => {
    const { result, sentTransactions, rpcCalls } = renderCastCommit();
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));

    await act(async () => {
      await result.current.commit.mutateAsync(commitParams);
    });

    expect(rpcCalls.filter((c) => c.method === "eth_signTypedData_v4")).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(signingKeyStorage)!)).toBe(SIGNING_KEY);

    const salt = await expectedSalt();
    const kit = DISPUTE_KIT_REGISTRY[DisputeKits.Classic];
    expect(getAddress(sentTransactions[0].to)).toBe(getAddress(kit.address));
    expect(decodeFunctionData({ abi: kit.disputeKitAbi, data: sentTransactions[0].data! })).toMatchObject({
      functionName: "castCommit",
      args: [12n, [3n, 4n], hashVote(2n, salt)],
    });
  });

  it("stores choice and salt so the vote can be revealed later", async () => {
    const { result } = renderCastCommit();
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));

    await act(async () => {
      await result.current.commit.mutateAsync(commitParams);
    });

    expect(JSON.parse(localStorage.getItem(getVoteKey(12n, 1, [3n, 4n]))!)).toEqual({
      choice: "2",
      salt: (await expectedSalt()).toString(),
    });
  });

  it("reuses a stored signing key instead of asking the wallet to sign again", async () => {
    localStorage.setItem(signingKeyStorage, JSON.stringify(SIGNING_KEY));
    const { result, rpcCalls, sentTransactions } = renderCastCommit();
    await waitFor(() => expect(result.current.account.isConnected).toBe(true));

    await act(async () => {
      await result.current.commit.mutateAsync(commitParams);
    });

    expect(rpcCalls.filter((c) => c.method === "eth_signTypedData_v4")).toEqual([]);
    expect(sentTransactions).toHaveLength(1);
  });
});
