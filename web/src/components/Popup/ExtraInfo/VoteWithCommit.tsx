import React from "react";
import styled from "styled-components";
import InfoCircle from "tsx:svgs/icons/info-circle.svg";

const Container = styled.div`
  display: flex;
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
  align-items: center;
  margin: 0 calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
  margin-top: calc(8px + (24 - 8) * ((100vw - 300px) / (1250 - 300)));
  font-size: 14px;
`;

const StyledInfoCircle = styled(InfoCircle)`
  width: 16px;
  height: 16px;
`;

interface IVoteWithCommit {}

const VoteWithCommit: React.FC<IVoteWithCommit> = ({}) => {
  return (
    <Container>
      <StyledInfoCircle />
      Subscribe to receive notifications to be reminded when the reveal time comes.
    </Container>
  );
};
export default VoteWithCommit;
