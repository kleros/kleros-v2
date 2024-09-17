import React from "react";
import styled from "styled-components";

import LawBalance from "svgs/icons/law-balance.svg";
import LongArrowUp from "svgs/icons/long-arrow-up.svg";

import { useHomePageExtraStats, HomePageExtraStatsType } from "hooks/queries/useHomePageExtraStats";

import ExtraStatsDisplay from "components/ExtraStatsDisplay";

const StyledCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0 32px;
  justify-content: center;
`;

interface IStat {
  title: string;
  getText: (data: HomePageExtraStatsType) => string | null;
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "Most Cases",
    getText: (data) => data.MostActiveCourt,
    icon: LongArrowUp,
  },
  {
    title: "Highest drawing chance",
    getText: (data) => data.HighestDrawingChance,
    icon: LongArrowUp,
  },
  {
    title: "Highest rewards chance",
    getText: (data) => data.HighestRewardChance,
    icon: LongArrowUp,
  },
];

const ExtraStats = () => {
  const data = useHomePageExtraStats();
  return (
    <StyledCard>
      <ExtraStatsDisplay title="Activity (Last 7 days)" icon={LawBalance} />
      {stats.map(({ title, getText, icon }, i) => {
        return <ExtraStatsDisplay key={i} {...{ title, icon }} text={getText(data)} />;
      })}
    </StyledCard>
  );
};

export default ExtraStats;
