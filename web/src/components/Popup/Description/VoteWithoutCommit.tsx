import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDescription = styled.div`
  display: flex;
  margin-bottom: calc(16px + (32 - 16) * ((100vw - 300px) / (1250 - 300)));
  margin-left: calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
  margin-right: calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
`;

interface IVoteWithoutCommit {
  date: string;
}

const VoteWithoutCommit: React.FC<IVoteWithoutCommit> = ({ date }) => {
  return (
    <Container>
      <StyledDescription>
        The decision date is {date} with the possibility for appeals. After that time you will be informed about the
        jury decision.
      </StyledDescription>
    </Container>
  );
};
export default VoteWithoutCommit;
