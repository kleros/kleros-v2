import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import { Answer } from "context/NewDisputeContext";
import { getVoteChoice } from "utils/getVoteChoice";
import { isUndefined } from "utils/index";

import { InternalLink } from "components/InternalLink";
import JurorTitle from "pages/Home/TopJurors/JurorCard/JurorTitle";

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 11px;
  flex-wrap: wrap;
  ${landscapeStyle(
    () => css`
      flex-direction: row;
      align-items: center;
      gap: 12px;
    `
  )}
`;

const AddressContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledLabel = styled.label<{ variant?: string }>`
  color: ${({ theme, variant }) => (variant ? theme[variant] : theme.primaryText)};
  font-size: 16px;
`;

const StyledSmall = styled.small`
  font-size: 16px;
`;

const StyledInternalLink = styled(InternalLink)`
  :hover {
    label {
      cursor: pointer;
      color: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

const VoteStatus: React.FC<{
  choice?: string;
  period: string;
  answers: Answer[];
  commited: boolean;
  isActiveRound: boolean;
  hiddenVotes: boolean;
}> = ({ choice, period, answers, isActiveRound, commited, hiddenVotes }) => {
  if (hiddenVotes) {
    if (!commited && (isActiveRound ? ["vote", "appeal", "execution"].includes(period) : true))
      return <StyledLabel>Did not commit vote </StyledLabel>;

    if (["evidence", "commit"].includes(period))
      return <StyledLabel>{commited ? "Vote committed" : "Pending vote commitment"}</StyledLabel>;
  }

  // not voted
  if (isUndefined(choice) && (isActiveRound ? ["appeal", "execution"].includes(period) : true))
    return <StyledLabel>Did not vote</StyledLabel>;

  return (
    <StyledLabel>
      {isUndefined(choice) ? "Pending Vote" : <StyledSmall>{getVoteChoice(choice, answers)}</StyledSmall>}
    </StyledLabel>
  );
};

const AccordionTitle: React.FC<{
  juror: string;
  choice?: string;
  voteCount: number;
  period: string;
  answers: Answer[];
  isActiveRound: boolean;
  commited: boolean;
  hiddenVotes: boolean;
}> = ({ juror, choice, voteCount, period, answers, isActiveRound, commited, hiddenVotes }) => {
  const profileLink = `/profile/1/desc/all?address=${juror}`;

  return (
    <TitleContainer>
      <AddressContainer>
        <StyledInternalLink to={profileLink}>
          <JurorTitle address={juror} />
        </StyledInternalLink>
      </AddressContainer>
      <VoteStatus {...{ choice, period, answers, isActiveRound, commited, hiddenVotes }} />
      <StyledLabel variant="secondaryPurple">
        {voteCount} vote{voteCount > 1 && "s"}
      </StyledLabel>
    </TitleContainer>
  );
};

export default AccordionTitle;
