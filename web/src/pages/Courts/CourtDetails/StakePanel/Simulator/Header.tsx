import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import ChartIcon from "svgs/icons/chart.svg";
import PNKLogo from "svgs/styled/pnk.svg";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const PNKLogoAndTitle = styled.div`
  display: flex;
  gap: 0 12px;
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
  const { t } = useTranslation();
  return (
    <Container>
      <PNKLogoAndTitle>
        <StyledPNKLogo />
        <Title>{t("stats.simulator")}</Title>
      </PNKLogoAndTitle>
      <Last30DaysContainer>
        <StyledChartIcon />
        <Last30DaysText>{t("time_ranges.last_30_days")}</Last30DaysText>
      </Last30DaysContainer>
    </Container>
  );
};
export default Header;
