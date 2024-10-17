import React from "react";
import styled from "styled-components";

import PNKLogo from "svgs/styled/pnk.svg";
import ChartIcon from "svgs/icons/chart.svg";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PNKLogoAndTitle = styled.div`
  display: flex;
  gap: 0 16px;
  align-items: center;
`;

const StyledChartIcon = styled(ChartIcon)`
  path {
    fill: ${({ theme }) => theme.primaryText};
  }
`;

const StyledPNKLogo = styled(PNKLogo)`
  width: 32px;
  height: 32px;
  [class$="stop-1"] {
    stop-color: ${({ theme }) => theme.primaryBlue};
  }
  [class$="stop-2"] {
    stop-color: ${({ theme }) => theme.secondaryPurple};
  }
`;

const Title = styled.p`
  margin: 0;
  font-weight: 600;
`;

const Last30DaysContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Last30DaysText = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
`;

const Header: React.FC = () => {
  return (
    <Container>
      <PNKLogoAndTitle>
        <StyledPNKLogo />
        <Title>Simulator</Title>
      </PNKLogoAndTitle>
      <Last30DaysContainer>
        <StyledChartIcon />
        <Last30DaysText>Last 30 Days</Last30DaysText>
      </Last30DaysContainer>
    </Container>
  );
};
export default Header;
