import React from "react";
import styled from "styled-components";
import PnkIcon from "tsx:assets/svgs/styled/pnk.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  align-items: center;
`;

const StyledPnkIcon = styled(PnkIcon)`
  width: calc(220px + (280 - 220) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  height: calc(220px + (252 - 220) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

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
