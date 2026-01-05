import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { Card as _Card } from "@kleros/ui-components-library";

import ArrowIcon from "svgs/icons/arrow.svg";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { StyledArrowLink } from "components/StyledArrowLink";

import CaseNumber from "./CaseNumber";
import CaseStatus from "./CaseStatus";
import CourtName from "./CourtName";
import Round from "./Round";
import Vote from "./Vote";
import VoteCount from "./VoteCount";

const Container = styled(_Card)`
  display: flex;
  flex-direction: column;
  height: auto;
  width: 100%;
  padding: 20px 16px 24px;
  border-left: 5px solid ${({ theme }) => theme.secondaryPurple};
  gap: 16px;

  :hover {
    cursor: auto;
  }

  ${({ theme }) => (theme.name === "light" ? `box-shadow: 0px 2px 3px 0px ${theme.stroke};` : "")}

  ${landscapeStyle(
    () => css`
      display: grid;
      grid-template-columns:
        minmax(70px, 0.3fr)
        minmax(140px, 1.2fr)
        minmax(140px, 1.3fr)
        minmax(70px, 0.6fr)
        minmax(70px, 0.5fr)
        minmax(70px, 0.5fr)
        auto;
      align-items: center;
      padding: 21.5px 28px;
      gap: ${responsiveSize(12, 16, 900)};
    `
  )}
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${landscapeStyle(
    () => css`
      display: contents;
    `
  )}
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  ${landscapeStyle(
    () => css`
      display: contents;
    `
  )}
`;

const ReStyledArrowLink = styled(StyledArrowLink)`
  font-size: 14px;

  > svg {
    height: 15px;
    width: 15px;
  }

  ${landscapeStyle(
    () => css`
      justify-self: end;
    `
  )}
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
  const period = draw.dispute?.period || "";
  const hiddenVotes = draw.dispute?.court?.hiddenVotes || false;
  const currentRoundIndex = draw.dispute?.currentRoundIndex || 0;
  const roundIndexNum = parseInt(roundIndex);
  const isActiveRound = currentRoundIndex === roundIndexNum;

  // Fetch dispute details to get the answer labels
  const { data: populatedDisputeData, isLoading: isLoadingDisputeData } = usePopulatedDisputeData(
    draw.dispute?.id,
    arbitrableAddress
  );

  // Determine the vote choice text based on the dispute template
  // Using same logic as in Cases/CaseDetails/Voting/VotesDetails/AccordionTitle.tsx
  const voteChoice = useMemo(() => {
    const choice = voteData?.choice;
    const commited = Boolean(voteData?.commited);

    // For hidden votes courts
    if (hiddenVotes) {
      if (!commited && (isActiveRound ? ["vote", "appeal", "execution"].includes(period) : true)) {
        return "Did not commit vote";
      }

      if (["evidence", "commit"].includes(period)) {
        return commited ? "Vote committed" : "Pending vote commitment";
      }
    }

    // For all courts - check if they voted
    if (
      (choice === null || choice === undefined) &&
      (isActiveRound ? ["appeal", "execution"].includes(period) : true)
    ) {
      return "Did not vote";
    }

    // If choice is still undefined, show pending
    if (choice === null || choice === undefined) {
      return "Pending";
    }

    const choiceNum = parseInt(voteData.choice.toString());

    // Choice 0 is always "Refuse to Arbitrate"
    if (choiceNum === 0) return "Refuse to Arbitrate";

    // If still loading dispute data or no data yet, return null to show skeleton
    if (isLoadingDisputeData || !populatedDisputeData) {
      return null;
    }

    // Try to find the answer from the populated dispute data
    const answer = populatedDisputeData?.answers?.find((answer) => BigInt(answer.id) === BigInt(choiceNum));

    if (answer?.title) {
      return answer.title;
    }

    // Fallback to Answer 0xN format if no answer found
    return `Answer 0x${choiceNum}`;
  }, [voteData, populatedDisputeData, isLoadingDisputeData, hiddenVotes, isActiveRound, period]);

  return (
    <Container hover>
      <LeftContent>
        <CaseNumber id={caseId} />
        <CourtName name={courtName} courtId={courtId} />
        <Vote choice={voteChoice} />
        <Round number={roundNumber} />
        <CaseStatus period={draw.dispute?.period} ruled={draw.dispute?.ruled} />
        <BottomRow>
          <VoteCount count={voteCount} />
          <ReStyledArrowLink to={`/cases/${caseId?.toString()}/voting`}>
            View vote <ArrowIcon />
          </ReStyledArrowLink>
        </BottomRow>
      </LeftContent>
    </Container>
  );
};

export default VoteCard;
