import React from "react";
import styled from "styled-components";
import InfoCircle from "tsx:svgs/icons/info-circle.svg";

const Container = styled.div`
  display: flex;
  gap: 8px;
  text-align: center;
  align-items: center;
  margin: 0 calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
  margin-top: calc(8px + (24 - 8) * ((100vw - 300px) / (1250 - 300)));
  small {
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.secondaryText};
    line-height: 19px;
  }
`;

const StyledInfoCircle = styled(InfoCircle)`
  min-width: 16px;
  min-height: 16px;
`;

const VoteWithCommitExtraInfo: React.FC = () => {
  return (
    <Container>
      <StyledInfoCircle />
      <small>Subscribe to receive notifications to be reminded when the reveal time comes.</small>
    </Container>
  );
};
export default VoteWithCommitExtraInfo;
