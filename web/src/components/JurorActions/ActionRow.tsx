import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Address } from "viem";

import { useDisputeTemplateData } from "hooks/queries/usePopulatedDisputeData";
import type { JurorAction } from "utils/jurorActions";

import { landscapeStyle } from "styles/landscapeStyle";

import Spinner from "components/Spinner";
import { StyledSkeleton } from "components/StyledSkeleton";

import Deadline from "./Deadline";

const CaseInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const DeadlineCell = styled.div`
  min-width: 0;
`;

const Confirming = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};

  @media (prefers-reduced-motion: reduce) {
    svg {
      animation: none;
    }
  }
`;

// Styled after the library's small Button (primary, or secondary when `$isPrimary` is false), but a link.
const ActionLink = styled(Link)<{ $isPrimary: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  padding: 5px 23px;
  border: 1px solid ${({ theme }) => theme.primaryBlue};
  border-radius: 3px;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  white-space: nowrap;
  transition: background-color ${({ theme }) => theme.transitionSpeed} ease;

  ${({ $isPrimary, theme }) =>
    $isPrimary
      ? css`
          background-color: ${theme.primaryBlue};
          color: ${theme.whiteBackground};

          &:hover {
            border-color: ${theme.secondaryBlue};
            background-color: ${theme.secondaryBlue};
            color: ${theme.whiteBackground};
          }
        `
      : css`
          background-color: ${theme.whiteBackground};
          color: ${theme.primaryBlue};

          &:hover {
            background-color: ${theme.mediumBlue};
            color: ${theme.primaryBlue};
          }
        `}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primaryBlue};
    outline-offset: 2px;
  }
`;

// Compact: case on top, deadline and button below it. Wide: one line, in the list's columns.
const Row = styled.li<{ $isCompact: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px 16px;
  padding: 16px 0;
  border-top: 1px solid ${({ theme }) => theme.stroke};

  ${CaseInfo} {
    grid-column: 1 / -1;
  }

  ${Confirming} {
    grid-column: 1 / -1;
  }

  ${({ $isCompact }) =>
    !$isCompact &&
    landscapeStyle(
      () => css`
        grid-column: 1 / -1;
        /* Without subgrid support, each row sizes its own columns. */
        grid-template-columns: minmax(0, 1fr) auto auto;
        grid-template-columns: subgrid;
        gap: 24px;

        ${CaseInfo} {
          grid-column: 1;
        }

        ${Confirming} {
          grid-column: 2 / -1;
        }
      `
    )}
`;

const TitleLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
`;

const CaseId = styled.span`
  flex-shrink: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
  font-variant-numeric: tabular-nums;
`;

const Title = styled.span`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  min-width: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.secondaryText};

  > * + *::before {
    content: "·";
    margin-right: 8px;
  }
`;

const useActionLabels = ({ kind, disputeId }: JurorAction) => {
  const { t } = useTranslation();
  switch (kind) {
    case "commit":
      return { text: t("juror_actions.commit"), label: t("juror_actions.commit_in_case", { id: disputeId }) };
    case "reveal":
      return { text: t("juror_actions.reveal"), label: t("juror_actions.reveal_in_case", { id: disputeId }) };
    default:
      return { text: t("juror_actions.vote"), label: t("juror_actions.vote_in_case", { id: disputeId }) };
  }
};

interface IActionRow {
  action: JurorAction;
  /** The next action to take: a filled button, the others are outlined. */
  isPrimary: boolean;
  isCompact: boolean;
  onLinkClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const ActionRow: React.FC<IActionRow> = ({ action, isPrimary, isCompact, onLinkClick }) => {
  const { t } = useTranslation();
  const { text, label } = useActionLabels(action);
  const { disputeId } = action;
  const {
    data: disputeDetails,
    isPending,
    isError,
    fetchStatus,
  } = useDisputeTemplateData(disputeId, action.arbitrable as Address, action.templateId, action.arbitrableChainId);
  // Loading, or paused while offline. A dispute without a template never loads one.
  const isLoadingTitle = isPending && fetchStatus !== "idle";
  // Same fallbacks as the case cards.
  const title = disputeDetails?.title ?? (isError ? t("errors.rpc_error") : t("errors.invalid_dispute_data"));

  return (
    <Row $isCompact={isCompact}>
      <CaseInfo>
        <TitleLine>
          <CaseId>#{disputeId}</CaseId>
          {isLoadingTitle ? <StyledSkeleton width={200} inline /> : <Title dir="auto">{title}</Title>}
        </TitleLine>
        <Meta>
          <span>{action.courtName || t("misc.unknown_court")}</span>
          {action.voteCount > 1 ? <span>{t("voting.vote", { count: action.voteCount })}</span> : null}
        </Meta>
      </CaseInfo>
      {action.isSubmitted ? (
        <Confirming>
          <Spinner aria-hidden />
          {t("juror_actions.submitted")}
        </Confirming>
      ) : (
        <>
          <DeadlineCell>
            <Deadline deadline={action.deadline} isUrgent={action.isUrgent} kind={action.kind} />
          </DeadlineCell>
          <ActionLink to={`/cases/${disputeId}/voting`} aria-label={label} onClick={onLinkClick} $isPrimary={isPrimary}>
            {text}
          </ActionLink>
        </>
      )}
    </Row>
  );
};

export default ActionRow;
