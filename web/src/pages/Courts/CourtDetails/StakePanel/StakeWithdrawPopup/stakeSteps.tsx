import React from "react";
import styled, { DefaultTheme } from "styled-components";

import { _TimelineItem1, StateProp } from "@kleros/ui-components-library";

import CheckIcon from "svgs/icons/check-circle-outline.svg";

import Spinner from "components/Spinner";
import TxnHash from "components/TxnHash";

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.secondaryPurple};
`;

const PartyContainer = styled.div`
  display: flex;
  gap: 8px;
`;

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
  theme: DefaultTheme,
  variant: string,
  state: StateProp["state"],
  amount: string,
  hash: `0x${string}` | undefined,
  error: any
): [_TimelineItem1, ..._TimelineItem1[]] => {
  const party = () => {
    if (variant === "refused") return hash ? <TxnHash hash={hash} variant="error" /> : <></>;
    return state === "loading" ? (
      <></>
    ) : (
      <PartyContainer>
        {hash && <TxnHash hash={hash} variant="pending" />}
        <Spinner />
      </PartyContainer>
    );
  };
  return [
    {
      title: "Approve in wallet",
      subtitle: error ? (error?.shortMessage ?? error.message) : "PNK spending",
      rightSided: true,
      variant,
      state,
      party: party(),
    },
    {
      title: "Stake in wallet",
      subtitle: "",
      rightSided: true,
      variant: theme.secondaryPurple,
      party: <StyledLabel>{amount} PNK</StyledLabel>,
      state: "disabled",
    },
  ];
};

const createStakeSteps = (
  theme: DefaultTheme,
  variant: string,
  state: StateProp["state"],
  amount: string,
  approvalHash: `0x${string}` | undefined,
  stakeHash: `0x${string}` | undefined,
  error: any,
  isStake: boolean
): [_TimelineItem1, ..._TimelineItem1[]] => {
  const party = () => {
    if (["refused", "accepted"].includes(variant))
      return stakeHash ? <TxnHash hash={stakeHash} variant={variant === "refused" ? "error" : "success"} /> : <></>;
    return state === "loading" ? (
      <StyledLabel>{amount} PNK</StyledLabel>
    ) : (
      <PartyContainer>
        {stakeHash && <TxnHash hash={stakeHash} variant="pending" />}
        <Spinner />
      </PartyContainer>
    );
  };
  return isStake
    ? [
        {
          title: "Approve in wallet",
          subtitle: "PNK spending",
          rightSided: true,
          variant: theme.success,
          party: approvalHash ? <TxnHash hash={approvalHash} variant="success" /> : <></>,
          Icon: CheckIcon,
        },
        {
          title: "Stake in wallet",
          subtitle: error ? (error?.shortMessage ?? error.message) : "",
          rightSided: true,
          variant,
          state,
          party: party(),
          Icon: variant === "accepted" ? CheckIcon : undefined,
        },
      ]
    : [
        {
          title: "Unstake in wallet",
          subtitle: error ? (error?.shortMessage ?? error.message) : "",
          rightSided: true,
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
  theme: DefaultTheme,
  approvalHash?: `0x${string}`,
  stakeHash?: `0x${string}`,
  error?: any
): [_TimelineItem1, ..._TimelineItem1[]] => {
  switch (stepType) {
    case StakeSteps.ApproveInitiate:
      return createApprovalSteps(theme, theme.secondaryPurple, "loading", amount, approvalHash, error);

    case StakeSteps.ApprovePending:
      return createApprovalSteps(theme, theme.secondaryPurple, "active", amount, approvalHash, error);
    case StakeSteps.ApproveFailed:
      return createApprovalSteps(theme, "refused", "active", amount, approvalHash, error);
    case StakeSteps.StakeInitiate:
      return createStakeSteps(theme, theme.secondaryPurple, "loading", amount, approvalHash, stakeHash, error, true);
    case StakeSteps.StakePending:
      return createStakeSteps(theme, theme.secondaryPurple, "active", amount, approvalHash, stakeHash, error, true);
    case StakeSteps.StakeFailed:
      return createStakeSteps(theme, "refused", "active", amount, approvalHash, stakeHash, error, true);
    case StakeSteps.StakeConfirmed:
      return createStakeSteps(theme, "accepted", "active", amount, approvalHash, stakeHash, error, true);
    case StakeSteps.WithdrawInitiate:
      return createStakeSteps(theme, theme.secondaryPurple, "loading", amount, approvalHash, stakeHash, error, false);
    case StakeSteps.WithdrawPending:
      return createStakeSteps(theme, theme.secondaryPurple, "active", amount, approvalHash, stakeHash, error, false);
    case StakeSteps.WithdrawConfirmed:
      return createStakeSteps(theme, "accepted", "active", amount, approvalHash, stakeHash, error, false);
    default:
      return createStakeSteps(theme, "refused", "active", amount, approvalHash, stakeHash, error, false);
  }
};
