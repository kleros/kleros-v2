import { parseEther } from "viem";
import { describe, it, expect } from "vitest";

import { Period } from "src/graphql/graphql";
import {
  aClassicAnswer,
  aClassicAppealDispute,
  aClassicDisputeKitDispute,
  aClassicLocalRound,
  aPopulatedDispute,
  aTemplateAnswer,
} from "src/test/builders";

import {
  getCurrentLocalRound,
  getFundedChoices,
  getLoserSideDeadline,
  getOptions,
  getRequiredFunding,
  getWinnerSideDeadline,
  getWinningChoice,
} from "./useClassicAppealContext";

describe("getRequiredFunding", () => {
  it.each([
    { cost: parseEther("1"), multiplier: 10000n, expected: parseEther("2") },
    { cost: parseEther("1"), multiplier: 5000n, expected: parseEther("1.5") },
    { cost: parseEther("0.3"), multiplier: 20000n, expected: parseEther("0.9") },
    { cost: parseEther("1"), multiplier: 0n, expected: parseEther("1") },
  ])("appeal cost $cost with stake multiplier $multiplier bps needs $expected", ({ cost, multiplier, expected }) => {
    expect(getRequiredFunding(cost, multiplier)).toBe(expected);
  });

  it("rounds the stake share down to the wei", () => {
    expect(getRequiredFunding(3n, 1n)).toBe(3n);
    expect(getRequiredFunding(19999n, 5000n)).toBe(19999n + 9999n);
  });

  it("treats a missing cost or multiplier as zero", () => {
    expect(getRequiredFunding(undefined, 10000n)).toBe(0n);
    expect(getRequiredFunding(parseEther("1"))).toBe(parseEther("1"));
  });
});

describe("appeal deadlines", () => {
  it("gives the winner side the full appeal period", () => {
    expect(getWinnerSideDeadline("1000", "10800")).toBe(11800);
  });

  it.each([
    { multiplier: "5000", expected: 1000 + 5400 },
    { multiplier: "10000", expected: 1000 + 10800 },
    { multiplier: "3333", expected: 1000 + Math.floor((10800 * 3333) / 10000) },
    { multiplier: "0", expected: 1000 },
  ])("scales the loser side period by $multiplier bps", ({ multiplier, expected }) => {
    expect(getLoserSideDeadline("1000", "10800", multiplier)).toBe(expected);
  });
});

describe("getCurrentLocalRound", () => {
  const r0 = aClassicLocalRound({ winningChoice: "1" });
  const r1 = aClassicLocalRound({ winningChoice: "2" });

  it("is undefined without a dispute or kit dispute", () => {
    expect(getCurrentLocalRound(undefined)).toBeUndefined();
    expect(getCurrentLocalRound(aClassicAppealDispute({ disputeKitDispute: [] }))).toBeUndefined();
  });

  it.each([Period.Appeal, Period.Execution])("uses the current round during %s", (period) => {
    const dispute = aClassicAppealDispute({
      period,
      disputeKitDispute: [aClassicDisputeKitDispute({ currentLocalRoundIndex: "1", localRounds: [r0, r1] })],
    });
    expect(getCurrentLocalRound(dispute)).toBe(r1);
  });

  it.each([Period.Evidence, Period.Commit, Period.Vote])("uses the previous round during %s", (period) => {
    const dispute = aClassicAppealDispute({
      period,
      disputeKitDispute: [aClassicDisputeKitDispute({ currentLocalRoundIndex: "1", localRounds: [r0, r1] })],
    });
    expect(getCurrentLocalRound(dispute)).toBe(r0);
  });

  it("indexes across kit disputes once the dispute jumped to another kit", () => {
    // The subgraph seeds a new kit dispute's currentLocalRoundIndex with the core round index.
    const r2 = aClassicLocalRound({ winningChoice: "0" });
    const dispute = aClassicAppealDispute({
      disputeKitDispute: [
        aClassicDisputeKitDispute({ id: "3-1", currentLocalRoundIndex: "1", localRounds: [r0, r1] }),
        aClassicDisputeKitDispute({ id: "1-1", currentLocalRoundIndex: "2", localRounds: [r2] }),
      ],
    });
    expect(getCurrentLocalRound(dispute)).toBe(r2);
  });
});

describe("getWinningChoice / getFundedChoices", () => {
  it("read the current local round", () => {
    const dispute = aClassicAppealDispute({
      disputeKitDispute: [
        aClassicDisputeKitDispute({
          localRounds: [aClassicLocalRound({ winningChoice: "2", fundedChoices: ["1"] })],
        }),
      ],
    });
    expect(getWinningChoice(dispute)).toBe("2");
    expect(getFundedChoices(dispute)).toEqual(["1"]);
  });

  it("are undefined before the dispute loads", () => {
    expect(getWinningChoice(undefined)).toBeUndefined();
    expect(getFundedChoices(undefined)).toBeUndefined();
  });
});

describe("getOptions", () => {
  const template = aPopulatedDispute({
    answers: [
      aTemplateAnswer({ id: "0x1", title: "Yes" }),
      aTemplateAnswer({ id: "0x2", title: "No" }),
      aTemplateAnswer({ id: "0xa", title: "Ten" }),
    ],
  });

  it("returns no options until the template is populated", () => {
    expect(getOptions(undefined, aClassicAppealDispute())).toEqual([]);
    expect(getOptions({} as never, aClassicAppealDispute())).toEqual([]);
  });

  it("converts hex answer ids to decimal and merges paid fees from the current round", () => {
    const dispute = aClassicAppealDispute({
      disputeKitDispute: [
        aClassicDisputeKitDispute({
          localRounds: [
            aClassicLocalRound({
              answers: [
                aClassicAnswer({ answerId: "2", paidFee: "500", funded: true }),
                aClassicAnswer({ answerId: "10", paidFee: "7" }),
              ],
            }),
          ],
        }),
      ],
    });

    expect(getOptions(template, dispute)).toEqual([
      expect.objectContaining({ id: "1", title: "Yes", paidFee: "0", funded: false }),
      expect.objectContaining({ id: "2", title: "No", paidFee: "500", funded: true }),
      expect.objectContaining({ id: "10", title: "Ten", paidFee: "7", funded: false }),
    ]);
  });

  it("defaults every option to unfunded when the subgraph has no round yet", () => {
    expect(getOptions(template, undefined).map(({ paidFee, funded }) => ({ paidFee, funded }))).toEqual([
      { paidFee: "0", funded: false },
      { paidFee: "0", funded: false },
      { paidFee: "0", funded: false },
    ]);
  });
});
