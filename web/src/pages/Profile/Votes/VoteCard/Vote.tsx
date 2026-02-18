import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import VotedIcon from "svgs/icons/voted-ballot.svg";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  overflow: hidden;
  min-width: 0;
`;

const StyledVotedIcon = styled(VotedIcon)`
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const BlueSmall = styled.small`
  color: ${({ theme }) => theme.primaryBlue};
  margin-left: -2px;
  flex-shrink: 0;
  font-weight: 400;
`;

const VoteValue = styled.small`
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;

interface IVote {
  choice: string | null;
}

const Vote: React.FC<IVote> = ({ choice }) => {
  const { t } = useTranslation();

  return (
    <Container>
      <StyledVotedIcon />
      <BlueSmall>{t("voting.vote_label")}: </BlueSmall>
      {choice === null ? <Skeleton width={80} height={14} /> : <VoteValue>{choice}</VoteValue>}
    </Container>
  );
};
export default Vote;
