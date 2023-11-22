import React from "react";
import styled from "styled-components";

const StyledText = styled.text`
  font-size: 16px;
  color: ${({ theme }) => theme.primaryText};
  margin-top: 16px;
`;

const ThanksText: React.FC = () => {
  return <StyledText>Thank you for being part of the Kleros community.</StyledText>;
};
export default ThanksText;
