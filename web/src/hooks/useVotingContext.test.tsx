import { waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { DISPUTE_KIT_REGISTRY } from "src/dispute-kits/registry";
import { Period } from "src/graphql/graphql";
import { aDisputeDetails, aDisputeDetailsRound, aDraw } from "src/test/builders";
import { MOCK_ACCOUNT_1 } from "src/test/mocks";
import { server } from "src/test/msw/server";
import { subgraphHandler, type RootResolvers } from "src/test/msw/subgraph";
import { renderHookWithProviders } from "src/test/renderWithProviders";

import { useVotingContext, VotingContextProvider } from "./useVotingContext";

const classicKit = DISPUTE_KIT_REGISTRY[DisputeKits.Classic];

const isVoteActive = (voted: boolean, seen: unknown[][] = []) => ({
  address: classicKit.address,
  abi: classicKit.disputeKitAbi,
  functionName: "isVoteActive",
  result: (args: readonly unknown[]) => {
    seen.push([...args]);
    return voted;
  },
});

const renderVotingContext = (resolvers: RootResolvers, reads = [isVoteActive(false)]) => {
  const subgraph = subgraphHandler(resolvers);
  server.use(subgraph.handler);
  const rendered = renderHookWithProviders(() => useVotingContext(), {
    route: "/cases/12/voting",
    path: "/cases/:id/*",
    reads,
    providers: [VotingContextProvider],
  });
  return { ...rendered, subgraphCalls: subgraph.calls };
};

const disputeIn = (period: Period, hiddenVotes = false) =>
  aDisputeDetails({
    period,
    currentRoundIndex: "1",
    currentRound: aDisputeDetailsRound({
      id: "12-1",
      hiddenVotes,
      disputeKit: { __typename: "DisputeKit", id: "1", address: classicKit.address },
    }),
  });

describe("useVotingContext", () => {
  it("reports a drawn juror in the vote period who has not voted yet", async () => {
    const seen: unknown[][] = [];
    const { result, subgraphCalls } = renderVotingContext(
      { dispute: () => disputeIn(Period.Vote), draws: () => [aDraw({ voteIDNum: "2" })] },
      [isVoteActive(false, seen)]
    );

    await waitFor(() => expect(result.current.hasVoted).toBe(false));
    expect(result.current).toMatchObject({
      wasDrawn: true,
      isVotingPeriod: true,
      isCommitPeriod: false,
      isHiddenVotes: false,
      isLoading: false,
    });
    expect(seen).toEqual([[12n, 1n, 2n]]);
    expect(subgraphCalls.find((c) => c.field === "draws")?.args).toEqual({
      first: 1000,
      where: { dispute: "12", juror: MOCK_ACCOUNT_1.toLowerCase(), round: "12-1" },
    });
  });

  it("reads the vote status from the dispute kit contract", async () => {
    const { result } = renderVotingContext({ dispute: () => disputeIn(Period.Vote), draws: () => [aDraw()] }, [
      isVoteActive(true),
    ]);

    await waitFor(() => expect(result.current.hasVoted).toBe(true));
  });

  it("exposes the commit of a juror in the commit period of a hidden-votes round", async () => {
    const commit = "0x1111111111111111111111111111111111111111111111111111111111111111";
    const { result } = renderVotingContext({
      dispute: () => disputeIn(Period.Commit, true),
      draws: () => [aDraw({ vote: { __typename: "ClassicVote", commited: true, commit } })],
    });

    await waitFor(() => expect(result.current.commited).toBe(true));
    expect(result.current).toMatchObject({ isCommitPeriod: true, isHiddenVotes: true, commit, wasDrawn: true });
  });

  it("is not drawn when the subgraph has no draw for the juror", async () => {
    const { result, rpcCalls } = renderVotingContext({ dispute: () => disputeIn(Period.Vote), draws: () => [] });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(result.current.isVotingPeriod).toBe(true));
    expect(result.current.wasDrawn).toBe(false);
    expect(result.current.hasVoted).toBeUndefined();
    expect(rpcCalls.filter((c) => c.method === "eth_call")).toEqual([]);
  });
});
