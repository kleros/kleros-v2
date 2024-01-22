import React from "react";
import styled from "styled-components";
import { Answer } from "context/NewDisputeContext";
import { responsiveSize } from "styles/responsiveSize";
import { isUndefined } from "utils/index";
import Identicon from "react-identicons";
import { getVoteChoice } from "utils/getVoteChoice";
import { shortenAddress } from "utils/shortenAddress";

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${responsiveSize(8, 12)};
  flex-wrap: wrap;
`;

const StyledLabel = styled.label<{ variant?: string }>`
  color: ${({ theme, variant }) => (variant ? theme[variant] : theme.primaryText)};
`;

const VoteStatus: React.FC<{
  choice?: string;
  period: string;
  answers: Answer[];
  isActiveRound: boolean;
}> = ({ choice, period, answers, isActiveRound }) => {
  if (isUndefined(choice) && (isActiveRound ? ["appeal", "execution"].includes(period) : true))
    return <StyledLabel>Forgot to vote</StyledLabel>;
  return (
    <StyledLabel>
      {isUndefined(choice) ? (
        "Pending Vote"
      ) : (
        <>
          Voted : <small>{getVoteChoice(parseInt(choice), answers)}</small>
        </>
      )}
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
}> = ({ juror, choice, voteCount, period, answers, isActiveRound }) => {
  return (
    <TitleContainer>
      <Identicon size="20" string={juror} />
      <StyledLabel variant="secondaryText">{shortenAddress(juror)}</StyledLabel>
      <VoteStatus {...{ choice, period, answers, isActiveRound }} />
      <StyledLabel variant="secondaryPurple">
        {voteCount} vote{voteCount > 1 && "s"}
      </StyledLabel>
    </TitleContainer>
  );
};

export default AccordionTitle;
