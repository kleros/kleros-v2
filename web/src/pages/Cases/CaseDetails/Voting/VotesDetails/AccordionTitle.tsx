import React from "react";
import styled, { css } from "styled-components";

import Identicon from "react-identicons";

import { Answer } from "context/NewDisputeContext";
import { getVoteChoice } from "utils/getVoteChoice";
import { isUndefined } from "utils/index";
import { shortenAddress } from "utils/shortenAddress";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

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

const VoteStatus: React.FC<{
  choice?: string;
  period: string;
  answers: Answer[];
  isActiveRound: boolean;
}> = ({ choice, period, answers, isActiveRound }) => {
  if (isUndefined(choice) && (isActiveRound ? ["appeal", "execution"].includes(period) : true))
    return <StyledLabel>Did not vote</StyledLabel>;
  return (
    <StyledLabel>
      {isUndefined(choice) ? "Pending Vote" : <StyledSmall>{getVoteChoice(parseInt(choice), answers)}</StyledSmall>}
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
