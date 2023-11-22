import React from "react";
import styled from "styled-components";

const StyledText = styled.text`
  font-size: calc(40px + (64 - 40) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  font-weight: 600;
  color: ${({ theme }) => theme.secondaryPurple};
  margin-top: 16px;
`;

const QuantityClaimed: React.FC = () => {
  return <StyledText>1,000 PNK</StyledText>;
};
export default QuantityClaimed;
