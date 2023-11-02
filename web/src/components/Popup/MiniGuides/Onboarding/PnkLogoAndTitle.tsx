import React from "react";
import styled, { useTheme } from "styled-components";
import DarkModePnkIcon from "tsx:assets/svgs/styled/dark-mode-pnk.svg";
import LightModePnkIcon from "tsx:assets/svgs/styled/light-mode-pnk.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  align-items: center;
`;

const StyledPnkIcon = styled.div`
  width: calc(220px + (280 - 220) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  height: calc(220px + (252 - 220) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
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
  const theme = useTheme();
  const PnkIcon = theme.name === "dark" ? DarkModePnkIcon : LightModePnkIcon;

  return (
    <Container>
      <StyledPnkIcon as={PnkIcon} />
      <StyledCourtLabel>Court v.2</StyledCourtLabel>
    </Container>
  );
};

export default PnkLogoAndTitle;
