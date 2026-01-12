import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { Answer } from "context/NewDisputeContext";
import { getVoteChoice } from "utils/getVoteChoice";
import { isUndefined } from "utils/index";

import { landscapeStyle } from "styles/landscapeStyle";

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
  const { t } = useTranslation();

  if (hiddenVotes) {
    if (!commited && (isActiveRound ? ["vote", "appeal", "execution"].includes(period) : true))
      return <StyledLabel>{t("voting.did_not_commit_vote")}</StyledLabel>;

    if (["evidence", "commit"].includes(period))
      return <StyledLabel>{commited ? t("voting.vote_committed") : t("voting.pending_vote_commitment")}</StyledLabel>;
  }

  // not voted
  if (isUndefined(choice) && (isActiveRound ? ["appeal", "execution"].includes(period) : true))
    return <StyledLabel>{t("voting.did_not_vote")}</StyledLabel>;

  return (
    <StyledLabel>
      {isUndefined(choice) ? t("voting.pending_vote") : <StyledSmall>{getVoteChoice(choice, answers)}</StyledSmall>}
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
  const { t } = useTranslation();
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
        {voteCount} {voteCount > 1 ? t("voting.votes") : t("voting.vote")}
      </StyledLabel>
    </TitleContainer>
  );
};

export default AccordionTitle;
