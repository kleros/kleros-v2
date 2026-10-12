import type { UserDetailsFragment, UserQuery } from "queries/useUser";

type Shift = UserDetailsFragment["shifts"][number];

export const aShift = (overrides: Partial<Shift> = {}): Shift => ({
  __typename: "JurorRewardPenalty",
  pnkAmount: "0",
  ethAmount: "0",
  ...overrides,
});

/** `UserQuery` for a juror with no disputes; the `UserDetails` fragment fields are inlined. */
export const aUserQuery = (overrides: Partial<UserDetailsFragment> = {}): UserQuery =>
  ({
    __typename: "Query",
    user: {
      __typename: "User",
      disputes: [],
      totalDisputes: "0",
      totalResolvedDisputes: "0",
      totalAppealingDisputes: "0",
      totalCoherentVotes: "0",
      totalResolvedVotes: "0",
      coherenceScore: "0",
      tokens: [],
      shifts: [],
      ...overrides,
    },
  }) as UserQuery;
