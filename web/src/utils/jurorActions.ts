import { Periods } from "consts/periods";

import type { JurorActionDraw } from "queries/useJurorActionDraws";

import type { JurorActionRules } from "src/dispute-kits/types";

import { getPeriodDeadline } from "./getPeriodDeadline";

export type JurorActionKind = "commit" | "vote" | "reveal";

export interface JurorAction {
  /** Stable across refetches. A re-draw in a later round is a new action. */
  key: string;
  kind: JurorActionKind;
  disputeId: string;
  arbitrable: string;
  /** Where the case's title comes from. */
  templateId?: string | null;
  arbitrableChainId?: string | null;
  courtName?: string | null;
  /** Block that started the current period. */
  periodStartBlock: bigint;
  /** Nominal end of the current period, in unix seconds. The juror can still act until the period is passed. */
  deadline: number;
  /** Vote IDs of the juror's draws in the case waiting for this action. Once submitted, the ones sent. */
  voteIds: string[];
  /** Under 24h left, or overdue. */
  isUrgent: boolean;
  isOverdue: boolean;
  /** Sent in this session, waiting for the subgraph to index it. */
  isSubmitted: boolean;
}

const URGENT_THRESHOLD = 24 * 60 * 60;

const getActionKind = (draw: JurorActionDraw, rules: JurorActionRules): JurorActionKind | undefined => {
  const { hiddenVotes } = draw.dispute.currentRound;
  const commited = draw.vote?.commited ?? false;
  const voted = draw.vote?.voted ?? false;

  switch (Periods[draw.dispute.period]) {
    case Periods.commit:
      return hiddenVotes && !commited ? "commit" : undefined;
    case Periods.vote:
      if (voted) return undefined;
      if (!hiddenVotes) return "vote";
      return commited && !rules.hasAutomaticVoteReveal ? "reveal" : undefined;
    default:
      return undefined;
  }
};

/** What the juror can do right now, one action per case, soonest deadline first. */
export const getJurorActions = (
  draws: readonly JurorActionDraw[],
  getRules: (disputeKitId: string) => JurorActionRules | undefined,
  now: number
): JurorAction[] => {
  const actions = new Map<string, JurorAction>();

  for (const draw of draws) {
    const { dispute } = draw;
    const { currentRound } = dispute;
    if (dispute.ruled || draw.round.id !== currentRound.id) continue;

    const rules = getRules(currentRound.disputeKit.id);
    const kind = rules && getActionKind(draw, rules);
    const deadline = getPeriodDeadline(Periods[dispute.period], dispute.lastPeriodChange, currentRound.timesPerPeriod);
    if (!kind || deadline === undefined) continue;

    const key = `${currentRound.id}-${kind}`;
    const action = actions.get(key);
    if (action) {
      action.voteIds.push(draw.voteIDNum);
      continue;
    }

    actions.set(key, {
      key,
      kind,
      disputeId: dispute.id,
      arbitrable: dispute.arbitrated.id,
      templateId: dispute.templateId,
      arbitrableChainId: dispute.arbitrableChainId,
      courtName: dispute.court.name,
      periodStartBlock: BigInt(dispute.lastPeriodChangeBlockNumber),
      deadline,
      voteIds: [draw.voteIDNum],
      isUrgent: deadline - now < URGENT_THRESHOLD,
      isOverdue: now >= deadline,
      isSubmitted: false,
    });
  }

  return [...actions.values()].sort((a, b) => a.deadline - b.deadline || Number(a.disputeId) - Number(b.disputeId));
};

/** A commit, vote or reveal sent from this app, maybe not indexed yet. */
export interface JurorActionSubmission {
  /** Block that included the transaction. */
  block: bigint;
  voteIds: readonly string[];
}

/**
 * Removes the votes submitted during the action's current period (older submissions belong to a previous round), and
 * flags the actions with no vote left as submitted. Those go last: the juror has nothing left to do there.
 */
export const applySubmissions = (
  actions: readonly JurorAction[],
  getSubmission: (action: JurorAction) => JurorActionSubmission | undefined
): JurorAction[] => {
  const flagged = actions.map((action) => {
    const submission = getSubmission(action);
    if (!submission || submission.block < action.periodStartBlock) return action;

    const submittedIds = new Set(submission.voteIds);
    const voteIds = action.voteIds.filter((voteId) => !submittedIds.has(voteId));
    if (voteIds.length === action.voteIds.length) return action;
    return voteIds.length > 0 ? { ...action, voteIds } : { ...action, isSubmitted: true };
  });
  return [...flagged.filter(({ isSubmitted }) => !isSubmitted), ...flagged.filter(({ isSubmitted }) => isSubmitted)];
};

/** Due actions when the banner was dismissed, and which of them were already urgent. */
export interface JurorActionsDismissal {
  keys: string[];
  urgentKeys: string[];
}

export const getDismissal = (dueActions: readonly JurorAction[]): JurorActionsDismissal => ({
  keys: dueActions.map(({ key }) => key),
  urgentKeys: dueActions.filter(({ isUrgent }) => isUrgent).map(({ key }) => key),
});

/** A dismissal holds until a new action is due or a dismissed one becomes urgent. */
export const isDismissed = (dismissal: JurorActionsDismissal | undefined, dueActions: readonly JurorAction[]) =>
  dismissal !== undefined &&
  dueActions.every(
    ({ key, isUrgent }) => dismissal.keys.includes(key) && (!isUrgent || dismissal.urgentKeys.includes(key))
  );

/** A case whose action changes (commit to reveal, or a re-draw) is added, not also removed. */
export const getJurorActionChanges = (previous: readonly JurorAction[], current: readonly JurorAction[]) => {
  const previousByKey = new Map(previous.map((action) => [action.key, action]));
  const currentCases = new Set(current.map(({ disputeId }) => disputeId));
  return {
    added: current.filter(({ key }) => !previousByKey.has(key)),
    becameUrgent: current.filter(({ key, isUrgent }) => isUrgent && previousByKey.get(key)?.isUrgent === false),
    removed: previous.filter(({ disputeId }) => !currentCases.has(disputeId)),
  };
};
