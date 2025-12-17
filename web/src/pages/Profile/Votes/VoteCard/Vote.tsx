import React from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";

import VotedIcon from "svgs/icons/voted-ballot.svg";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;

  small {
    font-weight: 400;
  }
`;

const StyledVotedIcon = styled(VotedIcon)`
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const BlueSmall = styled.small`
  color: ${({ theme }) => theme.primaryBlue};
  margin-left: -2px;
`;

interface IVote {
  choice: string | null;
}

const Vote: React.FC<IVote> = ({ choice }) => {
  return (
    <Container>
      <StyledVotedIcon />
      <BlueSmall>Vote: </BlueSmall>
      {choice === null ? <Skeleton width={80} height={14} /> : <small>{choice}</small>}
    </Container>
  );
};
export default Vote;
