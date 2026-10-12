import { describe, it, expect } from "vitest";

import { lightTheme } from "styles/themes";

import { getStakeSteps, StakeSteps } from "./stakeSteps";

const t = (key: string) => key;

describe("getStakeSteps", () => {
  const steps = (type: StakeSteps, error?: unknown) =>
    getStakeSteps(type, "1,000", lightTheme, t, "0xa11", "0x5a7", error).map(({ title, variant, state }) => ({
      title,
      variant,
      state,
    }));

  it.each([
    [StakeSteps.ApproveInitiate, lightTheme.secondaryPurple, "loading"],
    [StakeSteps.ApprovePending, lightTheme.secondaryPurple, "active"],
    [StakeSteps.ApproveFailed, "refused", "active"],
  ])("approval step %i: approve is %s/%s and stake waits disabled", (type, variant, state) => {
    expect(steps(type)).toEqual([
      { title: "wallet.approve_in_wallet", variant, state },
      { title: "wallet.stake_in_wallet", variant: lightTheme.secondaryPurple, state: "disabled" },
    ]);
  });

  it.each([
    [StakeSteps.StakeInitiate, lightTheme.secondaryPurple, "loading"],
    [StakeSteps.StakePending, lightTheme.secondaryPurple, "active"],
    [StakeSteps.StakeFailed, "refused", "active"],
    [StakeSteps.StakeConfirmed, "accepted", "active"],
  ])("stake step %i: approval done, stake is %s/%s", (type, variant, state) => {
    expect(steps(type)).toEqual([
      { title: "wallet.approve_in_wallet", variant: lightTheme.success, state: undefined },
      { title: "wallet.stake_in_wallet", variant, state },
    ]);
  });

  it.each([
    [StakeSteps.WithdrawInitiate, lightTheme.secondaryPurple, "loading"],
    [StakeSteps.WithdrawPending, lightTheme.secondaryPurple, "active"],
    [StakeSteps.WithdrawConfirmed, "accepted", "active"],
    [StakeSteps.WithdrawFailed, "refused", "active"],
  ])("withdraw step %i is a single unstake step %s/%s", (type, variant, state) => {
    expect(steps(type)).toEqual([{ title: "wallet.unstake_in_wallet", variant, state }]);
  });

  it("shows the wallet's short error message on the failed step", () => {
    const [, stake] = getStakeSteps(StakeSteps.StakeFailed, "1", lightTheme, t, undefined, undefined, {
      shortMessage: "User rejected the request.",
      message: "long",
    });
    expect(stake.subtitle).toBe("User rejected the request.");
  });
});
