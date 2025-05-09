import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  padding: 18px 24px;
  justify-content: space-between;
  margin-top: ${responsiveSize(12, 16)};
`;

const StyledLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
`;

const Header: React.FC = () => {
  return (
    <Container>
      <StyledLabel>Juror</StyledLabel>
      <StyledLabel>PNK Staked</StyledLabel>
    </Container>
  );
};

export default Header;
