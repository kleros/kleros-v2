import React from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const StyledTitle = styled.div`
  margin-left: ${responsiveSize(8, 44, 300)};
  margin-right: ${responsiveSize(8, 44, 300)};
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
`;

const StyledDateContainer = styled.span`
  color: ${({ theme }) => theme.primaryText};
`;

const StyledSubtitle = styled(StyledTitle)`
  margin-top: 24px;
  color: ${({ theme }) => theme.primaryText};
`;
interface IDisputeCreated {
  disputeId: number;
}

const DisputeCreated: React.FC<IDisputeCreated> = ({ disputeId }) => {
  return (
    <Container>
      <StyledTitle>
        🎉 Your case was successfully submitted to Kleros. A pool of jurors will be drawn to evaluate the case and vote
        at most <StyledDateContainer>April 25,2021</StyledDateContainer>. 🎉
      </StyledTitle>
      <StyledSubtitle>Now, it’s time to submit evidence to support the case.</StyledSubtitle>
    </Container>
  );
};
export default DisputeCreated;
