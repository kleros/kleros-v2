import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDescription = styled.div`
  margin-bottom: calc(16px + (32 - 16) * ((100vw - 300px) / (1250 - 300)));
  margin-left: calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
  margin-right: calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
  line-height: 21.8px;
`;

const EmphasizedDate = styled.span`
  font-size: 16px;
  font-weight: 400;
  line-height: 21.8px;
  color: ${({ theme }) => theme.primaryText};
`;

interface IVoteWithCommit {
  date: string;
}

const VoteWithCommit: React.FC<IVoteWithCommit> = ({ date }) => {
  return (
    <Container>
      <StyledDescription>
        Your vote is confirmed. It's kept secret until all jurors have cast their votes.
        <EmphasizedDate> You'll need to justify and reveal your vote on {date}</EmphasizedDate>
      </StyledDescription>
    </Container>
  );
};
export default VoteWithCommit;
