import React from "react";
import styled from "styled-components";
import InfoCircle from "tsx:svgs/icons/info-circle.svg";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  gap: 4px;
  text-align: center;
  margin: 0 calc(8px + (32 - 8) * ((100vw - 300px) / (1250 - 300)));
  ${responsiveSize("marginTop", 8, 24, 300)}
  font-size: 14px;
  font-weight: 400;
  line-height: 19px;
  color: ${({ theme }) => theme.secondaryText};
`;

const InfoCircleContainer = styled.div`
  display: flex;
  margin-top: 2px;

  svg {
    min-width: 16px;
    min-height: 16px;
  }
`;

const VoteWithCommitExtraInfo: React.FC = () => {
  return (
    <Container>
      <InfoCircleContainer>
        <InfoCircle />
      </InfoCircleContainer>
      Subscribe to receive notifications to be reminded when the reveal time comes.
    </Container>
  );
};
export default VoteWithCommitExtraInfo;
