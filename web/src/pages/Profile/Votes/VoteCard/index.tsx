import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import { Card as _Card } from "@kleros/ui-components-library";

import ArrowIcon from "svgs/icons/arrow.svg";

import { StyledArrowLink } from "components/StyledArrowLink";
import CourtName from "./CourtName";
import CaseNumber from "./CaseNumber";
import Vote from "./Vote";
import Round from "./Round";
import CaseStatus from "./CaseStatus";

const Container = styled(_Card)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: auto;
  width: 100%;
  padding: 20px 16px 24px;
  border-left: 5px solid ${({ theme }) => theme.secondaryPurple};
  flex-wrap: wrap;
  gap: 16px;

  :hover {
    cursor: auto;
  }

  ${({ theme }) => (theme.name === "light" ? `box-shadow: 0px 2px 3px 0px ${theme.stroke};` : "")}

  ${landscapeStyle(
    () => css`
      padding: 21.5px 28px;
    `
  )}
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px 24px;
`;

const ReStyledArrowLink = styled(StyledArrowLink)`
  font-size: 14px;

  > svg {
    height: 15px;
    width: 15px;
  }
`;

interface IVoteCard {}

const VoteCard: React.FC<IVoteCard> = ({}) => {
  const courtName = "Technical Court";
  const caseId = "10";

  return (
    <Container hover>
      <LeftContent>
        <CaseNumber id={caseId} />
        <CourtName name={courtName} />
        <Vote choice="No" />
        <Round number="3" />
        <CaseStatus />
      </LeftContent>
      <ReStyledArrowLink to={`/cases/${caseId?.toString()}/voting`}>
        View vote <ArrowIcon />
      </ReStyledArrowLink>
    </Container>
  );
};

export default VoteCard;
