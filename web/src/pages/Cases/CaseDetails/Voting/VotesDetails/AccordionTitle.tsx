import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import Identicon from "react-identicons";

import { Answer } from "context/NewDisputeContext";
import { DEFAULT_CHAIN, getChain } from "consts/chains";
import { getVoteChoice } from "utils/getVoteChoice";
import { isUndefined } from "utils/index";
import { shortenAddress } from "utils/shortenAddress";

import { landscapeStyle } from "styles/landscapeStyle";

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

const StyledA = styled.a`
  :hover {
    text-decoration: underline;
    label {
      cursor: pointer;
      color: ${({ theme }) => theme.primaryBlue};
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
  commited: boolean;
  hiddenVotes: boolean;
}> = ({ juror, choice, voteCount, period, answers, isActiveRound, commited, hiddenVotes }) => {
  const addressExplorerLink = useMemo(() => {
    return `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/address/${juror}`;
  }, [juror]);

  return (
    <TitleContainer>
      <AddressContainer>
        <Identicon size="20" string={juror} />
        <StyledA href={addressExplorerLink} rel="noopener noreferrer" target="_blank">
          <StyledLabel variant="secondaryText">{shortenAddress(juror)}</StyledLabel>
        </StyledA>
      </AddressContainer>
      <VoteStatus {...{ choice, period, answers, isActiveRound, commited, hiddenVotes }} />
      <StyledLabel variant="secondaryPurple">
        {voteCount} vote{voteCount > 1 && "s"}
      </StyledLabel>
    </TitleContainer>
  );
};

export default AccordionTitle;
