import { describe, it, expect } from "vitest";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { DISPUTE_KIT_REGISTRY } from "src/dispute-kits/registry";
import type { DisputeMaintenanceQuery } from "src/graphql/graphql";

import { getWithdrawFeesConfigs } from "./WithdrawAppealFees";

type Contribution = DisputeMaintenanceQuery["contributions"][number];

const ALICE = "0x00000000000000000000000000000000000a11ce";
const BOB = "0x0000000000000000000000000000000000000b0b";

const aContribution = (kit: number | string, overrides: Partial<Contribution> = {}): Contribution => ({
  __typename: "ClassicContribution",
  choice: "1",
  rewardWithdrawn: false,
  contributor: { __typename: "User", id: ALICE },
  localRound: { __typename: "ClassicRound", localDispute: { __typename: "ClassicDispute", id: `${kit}-12` } },
  coreDispute: { __typename: "Dispute", currentRoundIndex: "1" },
  ...overrides,
});

describe("getWithdrawFeesConfigs", () => {
  it.each(Object.values(DISPUTE_KIT_REGISTRY).map((kit) => [kit.displayName, kit] as const))(
    "withdraws from the %s kit that holds the contribution",
    (_, kit) => {
      const [config] = getWithdrawFeesConfigs("12", [aContribution(kit.id, { choice: "2" })]);

      expect(config).toEqual({
        abi: kit.disputeKitAbi,
        address: kit.address,
        functionName: "withdrawFeesAndRewards",
        args: [12n, ALICE, 2n],
      });
    }
  );

  it("routes each contribution of a dispute that changed kits to its own kit", () => {
    const configs = getWithdrawFeesConfigs("12", [
      aContribution(DisputeKits.Gated),
      aContribution(DisputeKits.Classic, { contributor: { __typename: "User", id: BOB } }),
    ]);

    expect(configs.map((c) => [c.address, c.args?.[1]])).toEqual([
      [DISPUTE_KIT_REGISTRY[DisputeKits.Gated].address, ALICE],
      [DISPUTE_KIT_REGISTRY[DisputeKits.Classic].address, BOB],
    ]);
  });

  it("skips withdrawn contributions and unknown kits", () => {
    expect(
      getWithdrawFeesConfigs("12", [aContribution(DisputeKits.Classic, { rewardWithdrawn: true }), aContribution(99)])
    ).toEqual([]);
    expect(getWithdrawFeesConfigs("12", undefined)).toEqual([]);
  });

  it.fails("KNOWN BUG: contributions to the same choice in several rounds produce duplicate withdraw calls", () => {
    // withdrawFeesAndRewards already loops over every round of the dispute for (beneficiary, choice).
    const round0 = aContribution(DisputeKits.Classic);
    const round1 = aContribution(DisputeKits.Classic, {
      coreDispute: { __typename: "Dispute", currentRoundIndex: "2" },
    });

    expect(getWithdrawFeesConfigs("12", [round0, round1])).toHaveLength(1);
  });
});
