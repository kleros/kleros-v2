import React from "react";
import styled, { css } from "styled-components";
import { Answer } from "context/NewDisputeContext";
import { responsiveSize } from "styles/responsiveSize";
import { isUndefined } from "utils/index";
import Identicon from "react-identicons";
import { getVoteChoice } from "utils/getVoteChoice";
import { shortenAddress } from "utils/shortenAddress";
import { landscapeStyle } from "styles/landscapeStyle";

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: ${responsiveSize(8, 12)};
  flex-wrap: wrap;
  ${landscapeStyle(
    () => css`
      flex-direction: row;
      align-items: center;
    `
  )}
`;
const AddressContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
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
      {isUndefined(choice) ? "Pending Vote" : <small>{getVoteChoice(parseInt(choice), answers)}</small>}
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
      <AddressContainer>
        <Identicon size="20" string={juror} />
        <StyledLabel variant="secondaryText">{shortenAddress(juror)}</StyledLabel>
      </AddressContainer>
      <VoteStatus {...{ choice, period, answers, isActiveRound }} />
      <StyledLabel variant="secondaryPurple">
        {voteCount} vote{voteCount > 1 && "s"}
      </StyledLabel>
    </TitleContainer>
  );
};

export default AccordionTitle;
