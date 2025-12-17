import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { Card as _Card } from "@kleros/ui-components-library";

import ArrowIcon from "svgs/icons/arrow.svg";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";

import { landscapeStyle } from "styles/landscapeStyle";

import { StyledArrowLink } from "components/StyledArrowLink";

import CaseNumber from "./CaseNumber";
import CaseStatus from "./CaseStatus";
import CourtName from "./CourtName";
import Round from "./Round";
import Vote from "./Vote";
import VoteCount from "./VoteCount";

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

const VoteCard: React.FC = ({ vote: draw }) => {
  // Extract dispute data from draw
  const courtName = draw.dispute?.court?.name || "Unknown Court";
  const courtId = draw.dispute?.court?.id || "0";
  const caseId = draw.dispute?.disputeID || "0";

  // Extract the round number from draw.round.id (format: "disputeID-roundIndex")
  const roundIndex = draw.round?.id?.split("-").pop() || "0";
  const roundNumber = (parseInt(roundIndex) + 1).toString();

  const arbitrableAddress = draw.dispute?.arbitrated?.id as `0x${string}` | undefined;
  const voteCount = draw.voteCount || 1;

  // Extract vote data (may be null if juror didn't vote)
  const voteData = draw.vote;

  // Fetch dispute details to get the answer labels
  const { data: populatedDisputeData, isLoading: isLoadingDisputeData } = usePopulatedDisputeData(
    draw.dispute?.id,
    arbitrableAddress
  );

  // Determine the vote choice text based on the dispute template
  const voteChoice = useMemo(() => {
    if (!voteData || !voteData.voted) {
      return "Did not vote";
    }
    if (voteData.choice === null || voteData.choice === undefined) {
      return "Pending";
    }

    const choiceNum = parseInt(voteData.choice.toString());

    // Choice 0 is always "Refuse to Arbitrate"
    if (choiceNum === 0) return "Refuse to Arbitrate";

    // If still loading dispute data, return null to show skeleton
    if (isLoadingDisputeData) {
      return null;
    }

    // Try to find the answer from the populated dispute data
    const answer = populatedDisputeData?.answers?.find((answer) => BigInt(answer.id) === BigInt(choiceNum));

    if (answer?.title) {
      return answer.title;
    }

    // Fallback to Answer 0xN format if no answer found
    return `Answer 0x${choiceNum}`;
  }, [voteData, populatedDisputeData?.answers, isLoadingDisputeData]);

  return (
    <Container hover>
      <LeftContent>
        <CaseNumber id={caseId} />
        <CourtName name={courtName} courtId={courtId} />
        <Vote choice={voteChoice} />
        <Round number={roundNumber} />
        <CaseStatus period={draw.dispute?.period} ruled={draw.dispute?.ruled} />
        <VoteCount count={voteCount} />
      </LeftContent>
      <ReStyledArrowLink to={`/cases/${caseId?.toString()}/voting`}>
        View vote <ArrowIcon />
      </ReStyledArrowLink>
    </Container>
  );
};

export default VoteCard;
