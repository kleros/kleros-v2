import React from "react";
import styled from "styled-components";

const StyledText = styled.text`
  font-size: calc(20px + (24 - 20) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  margin-top: 16px;
`;

const ClaimedText: React.FC = () => {
  return <StyledText>🎉 Claimed! 🎉</StyledText>;
};
export default ClaimedText;
