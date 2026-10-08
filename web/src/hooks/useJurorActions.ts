import { useMemo } from "react";

import { useAccount } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";
import { getSubmissionKey, useJurorActionSubmissions } from "hooks/useJurorActionSubmissions";
import { useNow } from "hooks/useNow";
import { applySubmissions, getJurorActions } from "utils/jurorActions";

import { useJurorActionDraws } from "queries/useJurorActionDraws";

import { getDisputeKitConfigByKitId } from "src/dispute-kits";

const getRules = (disputeKitId: string) => getDisputeKitConfigByKitId(disputeKitId)?.jurorActions;

/**
 * The commits, votes and reveals the connected juror can do right now, soonest deadline first.
 * The header indicator, its list and the Home banner all render this, so they always agree.
 */
export const useJurorActions = () => {
  const { address, chainId } = useAccount();
  const now = useNow(60_000);
  const submissions = useJurorActionSubmissions();
  const { data: draws, errorUpdateCount, isFetching, refetch } = useJurorActionDraws(address);

  const actions = useMemo(() => {
    if (!address || !draws) return undefined;
    return applySubmissions(getJurorActions(draws, getRules, now), ({ disputeId, kind }) => {
      const submission = submissions[getSubmissionKey(address, disputeId, kind)];
      return submission ? BigInt(submission.block) : undefined;
    });
  }, [address, draws, now, submissions]);

  const dueActions = useMemo(() => actions?.filter(({ isSubmitted }) => !isSubmitted) ?? [], [actions]);

  return {
    /** Undefined while disconnected or loading. Includes the ones submitted but not indexed yet. */
    actions,
    dueActions,
    urgentCount: dueActions.filter(({ isUrgent }) => isUrgent).length,
    /** The header shows the count: something is due, on the court's network (elsewhere, switching comes first). */
    isIndicatorVisible: dueActions.length > 0 && chainId === DEFAULT_CHAIN.id,
    /**
     * Loading failed and nothing loaded since. Unlike react-query's `isError`, it holds while a retry or a background
     * refetch runs. Once loaded, a failed refetch keeps showing the last data instead.
     */
    isError: errorUpdateCount > 0 && !actions,
    isRetrying: isFetching,
    retry: refetch,
  };
};
