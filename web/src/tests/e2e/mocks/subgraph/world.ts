import { privateKeyToAddress } from "viem/accounts";

import type {
  ClassicContribution,
  ClassicEvidence,
  Counter,
  CourtCounter,
  Draw,
  JurorTokensPerCourt,
  Round,
} from "src/graphql/graphql";

import {
  aCounter,
  aDraw,
  aCourt,
  aCourtCounter,
  aDispute,
  aDisputeTemplate,
  aStake,
  aUser,
  PERIODS,
  type FakeCourt,
  type FakeDispute,
  type FakeUser,
} from "../../builders/subgraph";
import { DAY, NOW_SECONDS, pnk, type Fake } from "../../builders/types";
import { ACCOUNT_PKEYS } from "../../utils/accounts";

import type { RootResolvers } from "./executor";
import { select } from "./query";

export const ALICE = privateKeyToAddress(ACCOUNT_PKEYS.alice).toLowerCase();
export const BOB = privateKeyToAddress(ACCOUNT_PKEYS.bob).toLowerCase();
export const JURORS = [
  "0x1000000000000000000000000000000000000001",
  "0x1000000000000000000000000000000000000002",
  "0x1000000000000000000000000000000000000003",
];

/** In-memory subgraph state; the default resolvers answer every query from it. */
export type World = {
  courts: FakeCourt[];
  disputes: FakeDispute[];
  users: FakeUser[];
  stakes: Fake<JurorTokensPerCourt>[];
  evidences: Fake<ClassicEvidence>[];
  draws: Fake<Draw>[];
  contributions: Fake<ClassicContribution>[];
  courtCounters: Fake<CourtCounter>[];
  /** Daily counters for the home charts; ids are unix timestamps in seconds. */
  counters: Fake<Counter>[];
  /** Overrides for the global counter; by default it is derived from `disputes`. */
  counter: Fake<Counter>;
  templates: ReturnType<typeof aDisputeTemplate>[];
};

/** Links `parent`/`children` from the flat list so tree queries and filters see the same objects. */
export const linkCourts = (courts: FakeCourt[]) => {
  for (const court of courts) {
    const parentId = (court.parent as FakeCourt | undefined)?.id;
    court.parent = parentId ? courts.find((c) => c.id === parentId) : undefined;
    court.children = courts.filter((c) => (c.parent as FakeCourt | undefined)?.id === court.id);
  }
  return courts;
};

/** General Court (1) with Blockchain (2) and Curation (3), 12 disputes cycling through every period. */
export const defaultWorld = (): World => {
  const general = aCourt({ id: "1", name: "General Court" });
  const blockchain = aCourt({ id: "2", name: "Blockchain", parent: { id: "1" }, minStake: pnk(300) });
  const curation = aCourt({ id: "3", name: "Curation", parent: { id: "1" }, minStake: pnk(250) });
  const courts = linkCourts([general, blockchain, curation]);

  const disputes = Array.from({ length: 12 }, (_, i) =>
    aDispute({ id: String(i + 1), period: PERIODS[i % PERIODS.length], court: courts[i % courts.length] })
  );

  const users = JURORS.map((address, i) =>
    aUser(address, {
      totalResolvedVotes: String(10 - i),
      totalCoherentVotes: String(9 - 2 * i),
      totalResolvedDisputes: String(8 - i),
      coherenceScore: String(90 - 10 * i),
    })
  );
  const stakes = users.map((user, i) => aStake(user, general, pnk(10_000 * (3 - i))));

  const counters = Array.from({ length: 30 }, (_, i) =>
    aCounter({
      id: String(NOW_SECONDS - (29 - i) * DAY),
      stakedPNK: pnk(1_000_000 + i * 10_000),
      cases: String(i < 18 ? Math.floor(i / 2) : 12),
    })
  );

  return {
    courts,
    disputes,
    users,
    stakes,
    evidences: [],
    draws: [],
    contributions: [],
    courtCounters: courts.map((court) => aCourtCounter(court)),
    counters,
    counter: {},
    templates: disputes.map((d) => aDisputeTemplate({ id: d.id as string })),
  };
};

/** Draws `juror` (address) in the dispute's current round, creating the user if needed. */
export const drawJuror = (world: World, disputeId: string, juror: string, voteIDNum = 0) => {
  const dispute = world.disputes.find((d) => d.id === disputeId);
  if (!dispute) throw new Error(`no dispute ${disputeId} in the world`);
  let user = world.users.find((u) => u.id === juror.toLowerCase());
  if (!user) {
    user = aUser(juror);
    world.users.push(user);
  }
  const draw = aDraw(dispute, user, voteIDNum);
  world.draws.push(draw);
  (dispute.currentRound as Fake<Round>).drawnJurors = [
    ...(((dispute.currentRound as Fake<Round>).drawnJurors ?? []) as Fake<Draw>[]),
    draw,
  ];
  return draw;
};

const byId = <T extends { id?: unknown }>(items: T[], id: unknown) =>
  items.find((item) => String(item.id).toLowerCase() === String(id).toLowerCase()) ?? null;

const deriveCounter = (world: World) =>
  aCounter({
    cases: String(world.disputes.length),
    casesRuled: String(world.disputes.filter((d) => d.ruled).length),
    casesAppealing: String(world.disputes.filter((d) => d.period === "appeal").length),
    casesVoting: String(world.disputes.filter((d) => d.period === "vote" || d.period === "commit").length),
    ...world.counter,
  });

export const coreResolvers = (world: World): RootResolvers => ({
  counter: () => deriveCounter(world),
  counters: (args) => select(world.counters, args),
  court: ({ id }) => byId(world.courts, id),
  courts: (args) => select(world.courts, args),
  courtCounters: (args) => select(world.courtCounters, args),
  dispute: ({ id }) => byId(world.disputes, id),
  disputes: (args) => select(world.disputes, args),
  user: ({ id }) => byId(world.users, id),
  users: (args) => select(world.users, args),
  jurorTokensPerCourts: (args) => select(world.stakes, args),
  evidences: (args) => select(world.evidences, args),
  evidenceSearch: ({ text, where }) =>
    select(world.evidences, { where }).filter((e) =>
      `${e.name} ${e.description}`.toLowerCase().includes(String(text).toLowerCase())
    ),
  draws: (args) => select(world.draws, args),
  contributions: (args) => select(world.contributions, args),
  round: ({ id }) => byId(world.disputes.flatMap((d) => (d.rounds ?? []) as Fake<unknown>[]) as { id?: unknown }[], id),
});

export const drtResolvers = (world: World): RootResolvers => ({
  disputeTemplate: ({ id }) => byId(world.templates, id),
});
