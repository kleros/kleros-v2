import React from "react";
import styled from "styled-components";

import VotesIcon from "svgs/icons/voted-ballot.svg";

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  small {
    font-weight: 400;
    color: ${({ theme }) => theme.secondaryPurple};
  }

  svg {
    path {
      fill: ${({ theme }) => theme.secondaryPurple};
    }
  }
`;

interface IVoteCount {
  count: number;
}

const VoteCount: React.FC<IVoteCount> = ({ count }) => {
  if (count <= 1) return null;

  return (
    <Container>
      <VotesIcon />
      <small>{count} votes</small>
    </Container>
  );
};

export default VoteCount;
