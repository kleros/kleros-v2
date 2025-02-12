import React from "react";
import styled from "styled-components";

import VotedIcon from "svgs/icons/voted-ballot.svg";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;

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
`;

interface IVote {
  choice: string;
}

const Vote: React.FC<IVote> = ({ choice }) => {
  return (
    <Container>
      <StyledVotedIcon />
      <BlueSmall>Vote: </BlueSmall>
      <small>{choice}</small>
    </Container>
  );
};
export default Vote;
