import React from "react";
import styled from "styled-components";
import InfoCircle from "tsx:svgs/icons/info-circle.svg";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  gap: 4px;
  text-align: center;
  margin: ${responsiveSize(8, 24, 300)} ${responsiveSize(8, 32, 300)} 0;
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
