import type { CounterQuery } from "queries/useCounter";
import type { CourtDetailsQuery } from "queries/useCourtDetails";

import { DEFAULT_TIMES_PER_PERIOD } from "./dispute";

type CourtDetails = NonNullable<CourtDetailsQuery["court"]>;
type Counter = NonNullable<CounterQuery["counter"]>;

/** `CourtDetailsQuery["court"]` for the General court with a 200 PNK minimum stake. */
export const aCourtDetails = (overrides: Partial<CourtDetails> = {}): CourtDetails => ({
  __typename: "Court",
  name: "General",
  policy: "/ipfs/QmCourtPolicy/policy.json",
  minStake: "200000000000000000000",
  alpha: "10000",
  numberDisputes: "12",
  numberClosedDisputes: "5",
  numberAppealingDisputes: "1",
  numberStakedJurors: "4",
  effectiveNumberStakedJurors: "4",
  numberVotes: "36",
  stake: "10000000000000000000000",
  effectiveStake: "10000000000000000000000",
  paidETH: "0",
  paidPNK: "0",
  timesPerPeriod: DEFAULT_TIMES_PER_PERIOD,
  feeForJuror: "1000000000000000",
  hiddenVotes: false,
  ...overrides,
});

/** Global `CounterQuery["counter"]`: 40 cases, 25 ruled, 3 appealing. */
export const aCounter = (overrides: Partial<Counter> = {}): Counter => ({
  __typename: "Counter",
  id: "0",
  cases: "40",
  casesRuled: "25",
  casesVoting: "12",
  casesAppealing: "3",
  stakedPNK: "0",
  redistributedPNK: "0",
  paidETH: "0",
  activeJurors: "4",
  ...overrides,
});
