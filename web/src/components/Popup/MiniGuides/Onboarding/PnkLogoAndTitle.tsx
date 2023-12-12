import React from "react";
import styled from "styled-components";
import PnkIcon from "tsx:assets/svgs/styled/pnk.svg";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  align-items: center;
`;

const StyledPnkIcon = styled(PnkIcon)`
  width: ${responsiveSize(220, 280)};
  height: ${responsiveSize(220, 252)};
  [class$="stop-1"] {
    stop-color: ${({ theme }) => theme.primaryBlue};
  }
  [class$="stop-2"] {
    stop-color: ${({ theme }) => theme.secondaryPurple};
  }
`;

const StyledCourtLabel = styled.label`
  font-size: 24px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.secondaryPurple} 0%,
    ${({ theme }) => theme.primaryBlue} 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PnkLogoAndTitle = () => {
  return (
    <Container>
      <StyledPnkIcon />
      <StyledCourtLabel>Court v.2</StyledCourtLabel>
    </Container>
  );
};

export default PnkLogoAndTitle;
