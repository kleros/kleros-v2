import React, { useMemo } from "react";
import styled, { DefaultTheme, keyframes } from "styled-components";

import { _TimelineItem1 } from "@kleros/ui-components-library";

import CheckIcon from "svgs/icons/check-circle-outline.svg";
import NewTabIcon from "svgs/icons/new-tab.svg";
import SpinnerIcon from "svgs/icons/spinner.svg";

import { DEFAULT_CHAIN, getChain } from "consts/chains";
import { parseWagmiError } from "utils/parseWagmiError";

import { ExternalLink } from "components/ExternalLink";

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.secondaryPurple};
`;

const rotating = keyframes`
    0%{
      transform: rotate(0deg);
    }
    50%{
      transform: rotate(180deg);
    }
    100%{
      transform: rotate(360deg);
    }
`;

const Spinner = styled(SpinnerIcon)`
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
  width: 16px;
  height: 16px;
  margin-right: 4px;
  animation: ${rotating} 2s ease-in-out infinite normal;
`;

const PartyContainer = styled.div`
  display: flex;
  gap: 8px;
`;
const TxnLabel = styled.label<{ variant: string }>`
  display: flex;
  gap: 4px;
  color: ${({ theme, variant }) => (variant === "pending" ? theme.primaryBlue : theme[variant])};
  cursor: pointer;
  path {
    fill: ${({ theme, variant }) => (variant === "pending" ? theme.primaryBlue : theme[variant])};
  }
`;

const TxnHash: React.FC<{ hash: `0x${string}`; variant: "success" | "error" | "pending" }> = ({ hash, variant }) => {
  const transactionExplorerLink = useMemo(() => {
    return `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/tx/${hash}`;
  }, [hash]);

  return (
    <ExternalLink to={transactionExplorerLink} rel="noopener noreferrer" target="_blank">
      <TxnLabel {...{ variant }}>
        {" "}
        <span>{hash.substring(0, 6) + "..." + hash.substring(hash.length - 4)}</span>
        <NewTabIcon />
      </TxnLabel>
    </ExternalLink>
  );
};

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
      return [
        {
          title: "Approve in wallet",
          subtitle: "PNK spending",
          rightSided: true,
          variant: theme.secondaryPurple,
          party: <></>,
        },
        {
          title: "Stake in wallet",
          subtitle: "",
          rightSided: true,
          variant: theme.secondaryPurple,
          party: <StyledLabel>{amount} PNK</StyledLabel>,
        },
      ];

    case StakeSteps.ApprovePending:
      return [
        {
          title: "Approve in wallet",
          subtitle: "PNK spending",
          rightSided: true,
          variant: theme.secondaryPurple,
          party: (
            <PartyContainer>
              {approvalHash && <TxnHash hash={approvalHash} variant="pending" />}
              <Spinner />
            </PartyContainer>
          ),
        },
        {
          title: "Stake in wallet",
          subtitle: "",
          rightSided: true,
          variant: theme.secondaryPurple,
          party: <StyledLabel>{amount} PNK</StyledLabel>,
        },
      ];
    case StakeSteps.ApproveFailed:
      return [
        {
          title: "Approve in wallet",
          subtitle: parseWagmiError(error),
          rightSided: true,
          variant: "refused",
          party: approvalHash ? <TxnHash hash={approvalHash} variant="error" /> : <></>,
        },
        {
          title: "Stake in wallet",
          subtitle: "",
          rightSided: true,
          variant: theme.secondaryPurple,
          party: <StyledLabel>{amount} PNK</StyledLabel>,
        },
      ];
    case StakeSteps.StakeInitiate:
      return [
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
          subtitle: "",
          rightSided: true,
          variant: theme.secondaryPurple,
          party: <StyledLabel>{amount} PNK</StyledLabel>,
        },
      ];
    case StakeSteps.StakePending:
      return [
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
          subtitle: "",
          rightSided: true,
          variant: theme.secondaryPurple,
          party: (
            <PartyContainer>
              {stakeHash && <TxnHash hash={stakeHash} variant="pending" />}
              <Spinner />
            </PartyContainer>
          ),
        },
      ];
    case StakeSteps.StakeFailed:
      return [
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
          subtitle: parseWagmiError(error),
          rightSided: true,
          variant: "refused",
          party: stakeHash ? <TxnHash hash={stakeHash} variant="error" /> : <></>,
        },
      ];
    case StakeSteps.StakeConfirmed:
      return [
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
          subtitle: "",
          rightSided: true,
          variant: theme.success,
          party: stakeHash ? <TxnHash hash={stakeHash} variant="success" /> : <></>,
          Icon: CheckIcon,
        },
      ];
    case StakeSteps.WithdrawInitiate:
      return [
        {
          title: "Un-Stake in wallet",
          subtitle: "",
          rightSided: true,
          variant: theme.secondaryPurple,
          party: <StyledLabel>{amount} PNK</StyledLabel>,
        },
      ];
    case StakeSteps.WithdrawPending:
      return [
        {
          title: "Un-Stake in wallet",
          subtitle: "",
          rightSided: true,
          variant: theme.secondaryPurple,
          party: (
            <PartyContainer>
              {stakeHash && <TxnHash hash={stakeHash} variant="pending" />}
              <Spinner />
            </PartyContainer>
          ),
        },
      ];
    case StakeSteps.WithdrawConfirmed:
      return [
        {
          title: "Un-Stake in wallet",
          subtitle: "",
          rightSided: true,
          variant: theme.success,
          party: stakeHash ? <TxnHash hash={stakeHash} variant="success" /> : <></>,
          Icon: CheckIcon,
        },
      ];
    default:
      return [
        {
          title: "Un-Stake in wallet",
          subtitle: parseWagmiError(error),
          rightSided: true,
          variant: "refused",
          party: stakeHash ? <TxnHash hash={stakeHash} variant="error" /> : <></>,
        },
      ];
  }
};
