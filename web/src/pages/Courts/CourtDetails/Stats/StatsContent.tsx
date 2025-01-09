import React from "react";
import styled from "styled-components";

import ChartIcon from "svgs/icons/chart.svg";

import { calculateSubtextRender } from "utils/calculateSubtextRender";
import { isUndefined } from "utils/index";

import { CourtDetailsQuery } from "queries/useCourtDetails";

import { responsiveSize } from "styles/responsiveSize";

import StatDisplay from "components/StatDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";

import { stats } from "./stats";

const TimeDisplayContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const AllTimeContainer = styled(TimeDisplayContainer)`
  padding: ${responsiveSize(12, 16)} 0;
`;

const StyledAllTimeText = styled.p`
  color: ${({ theme }) => theme.primaryText};
  margin: 0;
  font-size: 14px;
`;

const StyledChartIcon = styled(ChartIcon)`
  path {
    fill: ${({ theme }) => theme.primaryText};
  }
`;

const AccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px 0;
`;

const StatsContent: React.FC<{ court: CourtDetailsQuery["court"]; pricesData: any; coinIds: string[] }> = ({
  court,
  pricesData,
  coinIds,
}) => (
  <AccordionContainer>
    <div>
      <AllTimeContainer>
        <StyledChartIcon />
        <StyledAllTimeText>Parameters</StyledAllTimeText>
      </AllTimeContainer>
      <StyledCard>
        {stats.slice(0, 3).map(({ title, coinId, getText, getSubtext, color, icon }) => {
          const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
          return (
            <StatDisplay
              key={title}
              {...{ title, color, icon }}
              text={court ? getText(court) : <StyledSkeleton />}
              subtext={calculateSubtextRender(court, getSubtext, coinPrice)}
              isSmallDisplay={true}
            />
          );
        })}
      </StyledCard>
    </div>
    <div>
      <AllTimeContainer>
        <StyledChartIcon />
        <StyledAllTimeText>Activity</StyledAllTimeText>
      </AllTimeContainer>
      <StyledCard>
        {stats.slice(3, 7).map(({ title, coinId, getText, getSubtext, color, icon }) => {
          const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
          return (
            <StatDisplay
              key={title}
              {...{ title, color, icon }}
              text={court ? getText(court) : <StyledSkeleton />}
              subtext={calculateSubtextRender(court, getSubtext, coinPrice)}
              isSmallDisplay={true}
            />
          );
        })}
      </StyledCard>
    </div>
    <div>
      <AllTimeContainer>
        <StyledChartIcon />
        <StyledAllTimeText>Total Rewards</StyledAllTimeText>
      </AllTimeContainer>
      <StyledCard>
        {stats.slice(7, 9).map(({ title, coinId, getText, getSubtext, color, icon }) => {
          const coinPrice = !isUndefined(pricesData) ? pricesData[coinIds[coinId!]]?.price : undefined;
          return (
            <StatDisplay
              key={title}
              {...{ title, color, icon }}
              text={court ? getText(court) : <StyledSkeleton />}
              subtext={calculateSubtextRender(court, getSubtext, coinPrice)}
              isSmallDisplay={true}
            />
          );
        })}
      </StyledCard>
    </div>
  </AccordionContainer>
);

export default StatsContent;
