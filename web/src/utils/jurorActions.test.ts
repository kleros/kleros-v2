import { describe, expect, it } from "vitest";

import type { JurorActionDraw } from "queries/useJurorActionDraws";

import type { Period } from "src/graphql/graphql";

import {
  applySubmissions,
  getDismissal,
  getJurorActionChanges,
  getJurorActions,
  isDismissed,
  type JurorAction,
  type JurorActionRules,
} from "./jurorActions";

const NOW = 1_800_000_000;
const HOUR = 60 * 60;
const DAY = 24 * HOUR;
// evidence, commit, vote, appeal
const TIMES_PER_PERIOD = [DAY, 2 * DAY, 3 * DAY, DAY].map(String);

const PERIOD_START_BLOCK = 100n;

const CLASSIC = "1";
const SHUTTER = "2";
const UNKNOWN_KIT = "99";
const RULES: Record<string, JurorActionRules> = {
  [CLASSIC]: { hasAutomaticVoteReveal: false },
  [SHUTTER]: { hasAutomaticVoteReveal: true },
};
const getRules = (disputeKitId: string): JurorActionRules | undefined => RULES[disputeKitId];

interface DrawOptions {
  disputeId?: string;
  round?: number;
  currentRound?: number;
  voteId?: number;
  period?: "evidence" | "commit" | "vote" | "appeal" | "execution";
  ruled?: boolean;
  hiddenVotes?: boolean;
  disputeKitId?: string;
  lastPeriodChange?: number;
  commited?: boolean;
  voted?: boolean;
}

const makeDraw = ({
  disputeId = "1",
  round = 0,
  currentRound = round,
  voteId = 0,
  period = "vote",
  ruled = false,
  hiddenVotes = false,
  disputeKitId = CLASSIC,
  lastPeriodChange = NOW - HOUR,
  commited = false,
  voted = false,
}: DrawOptions = {}): JurorActionDraw => ({
  id: `${disputeId}-${round}-${voteId}`,
  voteIDNum: `${voteId}`,
  round: { id: `${disputeId}-${round}` },
  dispute: {
    id: disputeId,
    period: period as Period,
    ruled,
    lastPeriodChange: lastPeriodChange.toString(),
    lastPeriodChangeBlockNumber: PERIOD_START_BLOCK.toString(),
    templateId: "7",
    arbitrableChainId: "421614",
    arbitrated: { id: "0x0000000000000000000000000000000000000001" },
    court: { name: "General Court" },
    currentRound: {
      id: `${disputeId}-${currentRound}`,
      hiddenVotes,
      timesPerPeriod: TIMES_PER_PERIOD,
      disputeKit: { id: disputeKitId },
    },
  },
  // The subgraph creates the vote on the juror's first commit or vote.
  vote: commited || voted ? { commited, voted } : null,
});

const getActions = (draws: JurorActionDraw[], now = NOW) => getJurorActions(draws, getRules, now);
const summarize = (draws: JurorActionDraw[], now = NOW) =>
  getActions(draws, now).map(({ disputeId, kind }) => `${disputeId}:${kind}`);

describe("getJurorActions", () => {
  it("asks to commit in the commit period of a court with hidden votes", () => {
    const [action] = getActions([makeDraw({ period: "commit", hiddenVotes: true })]);
    expect(action).toMatchObject({
      key: "1-0-commit",
      kind: "commit",
      disputeId: "1",
      templateId: "7",
      arbitrableChainId: "421614",
      courtName: "General Court",
      periodStartBlock: PERIOD_START_BLOCK,
      deadline: NOW - HOUR + 2 * DAY,
      voteIds: ["0"],
      isUrgent: false,
      isOverdue: false,
      isSubmitted: false,
    });
    expect(summarize([makeDraw({ period: "commit", hiddenVotes: true, commited: true })])).toEqual([]);
  });

  it("asks to vote in the vote period of a court without hidden votes", () => {
    expect(summarize([makeDraw({ period: "vote" })])).toEqual(["1:vote"]);
    expect(summarize([makeDraw({ period: "vote", voted: true })])).toEqual([]);
  });

  it("asks to reveal a committed vote in the vote period", () => {
    expect(summarize([makeDraw({ period: "vote", hiddenVotes: true, commited: true })])).toEqual(["1:reveal"]);
    expect(summarize([makeDraw({ period: "vote", hiddenVotes: true, commited: true, voted: true })])).toEqual([]);
  });

  it("never asks to reveal in dispute kits that reveal automatically", () => {
    const draw = makeDraw({ period: "vote", hiddenVotes: true, commited: true, disputeKitId: SHUTTER });
    expect(summarize([draw])).toEqual([]);
    expect(summarize([makeDraw({ period: "commit", hiddenVotes: true, disputeKitId: SHUTTER })])).toEqual(["1:commit"]);
  });

  it("does not ask to reveal during the commit period", () => {
    expect(summarize([makeDraw({ period: "commit", hiddenVotes: true, commited: true })])).toEqual([]);
  });

  it("has nothing left to do after missing the commit", () => {
    expect(summarize([makeDraw({ period: "vote", hiddenVotes: true })])).toEqual([]);
  });

  it("has nothing to do outside the commit and vote periods", () => {
    expect(summarize([makeDraw({ period: "evidence" })])).toEqual([]);
    expect(summarize([makeDraw({ period: "appeal" })])).toEqual([]);
    expect(summarize([makeDraw({ period: "execution" })])).toEqual([]);
  });

  it("follows a period that ended early instead of projecting the previous deadline", () => {
    // All commits were cast, so the vote period opened an hour ago, a day before the commit deadline.
    const [reveal] = getActions([
      makeDraw({ period: "vote", hiddenVotes: true, commited: true, lastPeriodChange: NOW - HOUR }),
    ]);
    expect(reveal.deadline).toBe(NOW - HOUR + 3 * DAY);

    // All votes were cast, so the appeal period opened before the vote deadline.
    expect(summarize([makeDraw({ period: "appeal", lastPeriodChange: NOW - HOUR })])).toEqual([]);
  });

  it("keeps an overdue action, since the juror can act until the period is passed", () => {
    const [action] = getActions([makeDraw({ period: "vote", lastPeriodChange: NOW - 4 * DAY })]);
    expect(action).toMatchObject({ kind: "vote", deadline: NOW - DAY, isOverdue: true, isUrgent: true });
  });

  it("flags actions with less than 24 hours left as urgent", () => {
    const endingIn = (seconds: number) => makeDraw({ lastPeriodChange: NOW + seconds - 3 * DAY });
    expect(getActions([endingIn(DAY + 1)])[0]).toMatchObject({ isUrgent: false, isOverdue: false });
    expect(getActions([endingIn(DAY - 1)])[0]).toMatchObject({ isUrgent: true, isOverdue: false });
    expect(getActions([endingIn(0)])[0]).toMatchObject({ isUrgent: true, isOverdue: true });
  });

  it("merges the draws of a round into one action listing the juror's votes", () => {
    const draws = [0, 1, 2].map((voteId) => makeDraw({ voteId }));
    expect(getActions(draws)).toEqual([expect.objectContaining({ key: "1-0-vote", voteIds: ["0", "1", "2"] })]);
  });

  it("only counts the draws of the current round after an appeal", () => {
    const votedInFirstRound = makeDraw({ round: 0, currentRound: 1, voted: true });
    const redrawn = makeDraw({ round: 1, voteId: 4 });
    expect(getActions([votedInFirstRound, redrawn])).toEqual([
      expect.objectContaining({ key: "1-1-vote", voteIds: ["4"] }),
    ]);

    const notRedrawn = makeDraw({ round: 0, currentRound: 1 });
    expect(summarize([notRedrawn])).toEqual([]);
  });

  it("excludes ruled disputes", () => {
    expect(summarize([makeDraw({ ruled: true })])).toEqual([]);
  });

  it("ignores dispute kits without juror action rules", () => {
    expect(summarize([makeDraw({ disputeKitId: UNKNOWN_KIT })])).toEqual([]);
  });

  it("sorts by deadline, soonest first", () => {
    const draws = [
      makeDraw({ disputeId: "7", lastPeriodChange: NOW }),
      makeDraw({ disputeId: "5", period: "commit", hiddenVotes: true, lastPeriodChange: NOW - 3 * DAY }),
      makeDraw({ disputeId: "3", lastPeriodChange: NOW - 2 * DAY }),
      makeDraw({ disputeId: "2", lastPeriodChange: NOW - 2 * DAY }),
    ];
    expect(summarize(draws)).toEqual(["5:commit", "2:vote", "3:vote", "7:vote"]);
  });
});

describe("applySubmissions", () => {
  const [action] = getActions([makeDraw()]);
  const submitted = (block: bigint, voteIds = ["0"]) => ({ block, voteIds });

  it("flags actions submitted during their current period", () => {
    expect(applySubmissions([action], () => submitted(PERIOD_START_BLOCK))[0].isSubmitted).toBe(true);
    expect(applySubmissions([action], () => submitted(PERIOD_START_BLOCK + 50n))[0].isSubmitted).toBe(true);
    expect(applySubmissions([action], () => undefined)[0].isSubmitted).toBe(false);
  });

  it("ignores submissions made before the current period started", () => {
    expect(applySubmissions([action], () => submitted(PERIOD_START_BLOCK - 1n))[0].isSubmitted).toBe(false);
  });

  it("keeps an action due for the votes a submission did not cover", () => {
    const voteIds = Array.from({ length: 1002 }, (_, voteId) => voteId);
    const firstThousand = submitted(PERIOD_START_BLOCK, voteIds.slice(0, 1000).map(String));

    // Not indexed yet: the subgraph still lists every draw as waiting.
    const notIndexed = getActions(voteIds.map((voteId) => makeDraw({ voteId })));
    expect(applySubmissions(notIndexed, () => firstThousand)).toEqual([
      expect.objectContaining({ voteIds: ["1000", "1001"], isSubmitted: false }),
    ]);

    // Indexed: only the two draws left are waiting, and the submission doesn't cover them.
    const indexed = getActions(voteIds.map((voteId) => makeDraw({ voteId, voted: voteId < 1000 })));
    expect(applySubmissions(indexed, () => firstThousand)).toEqual([
      expect.objectContaining({ voteIds: ["1000", "1001"], isSubmitted: false }),
    ]);
  });

  it("moves submitted actions after the due ones", () => {
    const actions = getActions(
      [1, 2, 3].map((id) => makeDraw({ disputeId: `${id}`, lastPeriodChange: NOW - id * HOUR }))
    );
    const flagged = applySubmissions(actions, ({ disputeId }) =>
      disputeId === "3" ? submitted(PERIOD_START_BLOCK) : undefined
    );
    expect(flagged.map(({ disputeId, isSubmitted }) => `${disputeId}:${isSubmitted}`)).toEqual([
      "2:false",
      "1:false",
      "3:true",
    ]);
  });
});

const makeAction = (key: string, isUrgent = false, disputeId = key) => ({ key, isUrgent, disputeId }) as JurorAction;

describe("isDismissed", () => {
  const dismissal = getDismissal([makeAction("a"), makeAction("b", true)]);

  it("is not dismissed until the juror dismisses it", () => {
    expect(isDismissed(undefined, [makeAction("a")])).toBe(false);
  });

  it("stays dismissed while no new action is due", () => {
    expect(isDismissed(dismissal, [makeAction("a"), makeAction("b", true)])).toBe(true);
    expect(isDismissed(dismissal, [makeAction("b", true)])).toBe(true);
    expect(isDismissed(dismissal, [])).toBe(true);
  });

  it("comes back when a new action is due", () => {
    expect(isDismissed(dismissal, [makeAction("a"), makeAction("c")])).toBe(false);
  });

  it("comes back when a dismissed action drops under 24 hours", () => {
    expect(isDismissed(dismissal, [makeAction("a", true), makeAction("b", true)])).toBe(false);
  });
});

describe("getJurorActionChanges", () => {
  it("lists the actions added, the ones that became urgent and the ones removed", () => {
    const previous = [makeAction("a"), makeAction("b"), makeAction("c", true)];
    const current = [makeAction("b", true), makeAction("c", true), makeAction("d")];
    const { added, becameUrgent, removed } = getJurorActionChanges(previous, current);
    expect(added.map(({ key }) => key)).toEqual(["d"]);
    expect(becameUrgent.map(({ key }) => key)).toEqual(["b"]);
    expect(removed.map(({ key }) => key)).toEqual(["a"]);
  });

  it("reports a case whose action changes as added only", () => {
    const { added, removed } = getJurorActionChanges(
      [makeAction("15-0-commit", false, "15")],
      [makeAction("15-0-reveal", false, "15")]
    );
    expect(added.map(({ key }) => key)).toEqual(["15-0-reveal"]);
    expect(removed).toEqual([]);
  });
});
