import React from "react";

import CheckIcon from "svgs/icons/check-circle-outline.svg";

import { commify } from "utils/commify";

import type { CustomTimelineItem } from "src/utils/uiComponentsTypes";

import type { Theme } from "styles/themes";

import Spinner from "components/Spinner";
import TxnHash from "components/TxnHash";

export enum StakeSteps {
  ApproveInitiate,
  ApprovePending,
  ApproveFailed,
  StakeInitiate,
  StakeConfirmed,
  StakePending,
  StakeFailed,
  WithdrawInitiate,
  WithdrawPending,
  WithdrawConfirmed,
  WithdrawFailed,
}

const createApprovalSteps = (
  theme: Theme,
  variant: string,
  state: CustomTimelineItem["state"],
  amount: string,
  hash: `0x${string}` | undefined,
  error: any,
  t: (key: string) => string
): [CustomTimelineItem, ...CustomTimelineItem[]] => {
  const party = () => {
    if (variant === "refused") return hash ? <TxnHash hash={hash} variant="error" /> : <></>;
    return state === "loading" ? (
      <></>
    ) : (
      <div className="flex gap-2">
        {hash && <TxnHash hash={hash} variant="pending" />}
        <Spinner />
      </div>
    );
  };
  return [
    {
      title: t("wallet.approve_in_wallet"),
      subtitle: error ? (error?.shortMessage ?? error?.message) : t("wallet.pnk_spending"),
      variant,
      state,
      party: party(),
    },
    {
      title: t("wallet.stake_in_wallet"),
      subtitle: "",
      variant: theme.secondaryPurple,
      party: <label className="text-klerosUIComponentsSecondaryPurple">{commify(amount)} PNK</label>,
      state: "disabled",
    },
  ];
};

const createStakeSteps = (
  theme: Theme,
  variant: string,
  state: CustomTimelineItem["state"],
  amount: string,
  approvalHash: `0x${string}` | undefined,
  stakeHash: `0x${string}` | undefined,
  error: any,
  isStake: boolean,
  t: (key: string) => string
): [CustomTimelineItem, ...CustomTimelineItem[]] => {
  const party = () => {
    if (["refused", "accepted"].includes(variant))
      return stakeHash ? <TxnHash hash={stakeHash} variant={variant === "refused" ? "error" : "success"} /> : <></>;
    return state === "loading" ? (
      <label className="text-klerosUIComponentsSecondaryPurple">{commify(amount)} PNK</label>
    ) : (
      <div className="flex gap-2">
        {stakeHash && <TxnHash hash={stakeHash} variant="pending" />}
        <Spinner />
      </div>
    );
  };
  return isStake
    ? [
        {
          title: t("wallet.approve_in_wallet"),
          subtitle: t("wallet.pnk_spending"),
          variant: theme.success,
          party: approvalHash ? <TxnHash hash={approvalHash} variant="success" /> : <></>,
          Icon: CheckIcon,
        },
        {
          title: t("wallet.stake_in_wallet"),
          subtitle: error ? (error?.shortMessage ?? error?.message) : "",
          variant,
          state,
          party: party(),
          Icon: variant === "accepted" ? CheckIcon : undefined,
        },
      ]
    : [
        {
          title: t("wallet.unstake_in_wallet"),
          subtitle: error ? (error?.shortMessage ?? error?.message) : "",
          variant,
          state,
          party: party(),
          Icon: variant === "accepted" ? CheckIcon : undefined,
        },
      ];
};

export const getStakeSteps = (
  stepType: StakeSteps,
  amount: string,
  theme: Theme,
  t: (key: string) => string,
  approvalHash?: `0x${string}`,
  stakeHash?: `0x${string}`,
  error?: any
): [CustomTimelineItem, ...CustomTimelineItem[]] => {
  switch (stepType) {
    case StakeSteps.ApproveInitiate:
      return createApprovalSteps(theme, theme.secondaryPurple, "loading", amount, approvalHash, error, t);

    case StakeSteps.ApprovePending:
      return createApprovalSteps(theme, theme.secondaryPurple, "active", amount, approvalHash, error, t);
    case StakeSteps.ApproveFailed:
      return createApprovalSteps(theme, "refused", "active", amount, approvalHash, error, t);
    case StakeSteps.StakeInitiate:
      return createStakeSteps(theme, theme.secondaryPurple, "loading", amount, approvalHash, stakeHash, error, true, t);
    case StakeSteps.StakePending:
      return createStakeSteps(theme, theme.secondaryPurple, "active", amount, approvalHash, stakeHash, error, true, t);
    case StakeSteps.StakeFailed:
      return createStakeSteps(theme, "refused", "active", amount, approvalHash, stakeHash, error, true, t);
    case StakeSteps.StakeConfirmed:
      return createStakeSteps(theme, "accepted", "active", amount, approvalHash, stakeHash, error, true, t);
    case StakeSteps.WithdrawInitiate:
      return createStakeSteps(
        theme,
        theme.secondaryPurple,
        "loading",
        amount,
        approvalHash,
        stakeHash,
        error,
        false,
        t
      );
    case StakeSteps.WithdrawPending:
      return createStakeSteps(theme, theme.secondaryPurple, "active", amount, approvalHash, stakeHash, error, false, t);
    case StakeSteps.WithdrawConfirmed:
      return createStakeSteps(theme, "accepted", "active", amount, approvalHash, stakeHash, error, false, t);
    default:
      return createStakeSteps(theme, "refused", "active", amount, approvalHash, stakeHash, error, false, t);
  }
};
