import React, { useState } from "react";
import styled from "styled-components";

import LawBalance from "svgs/icons/law-balance.svg";
import LongArrowUp from "svgs/icons/long-arrow-up.svg";

import { useHomePageExtraStats } from "hooks/queries/useHomePageExtraStats";
import ExtraStatsDisplay from "components/ExtraStatsDisplay";
import { DropdownSelect } from "@kleros/ui-components-library";

const StyledCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0 32px;
  justify-content: center;
`;

interface IStat {
  title: string;
  getText: (data) => string | null;
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "Most Cases",
    getText: (data) => data?.mostDisputedCourt?.name,
    icon: LongArrowUp,
  },
  {
    title: "Highest drawing chance",
    getText: (data) => data?.bestDrawingChancesCourt?.name,
    icon: LongArrowUp,
  },
  {
    title: "Highest rewards chance",
    getText: (data) => data?.bestExpectedRewardCourt?.name,
    icon: LongArrowUp,
  },
];

const timeRanges = [
  { value: 7, text: "Last 7 days" },
  { value: 30, text: "Last 30 days" },
  { value: 90, text: "Last 90 days" },
  { value: 180, text: "Last 180 days" },
  { value: 365, text: "Last 365 days" },
  { value: "allTime", text: "All Time" },
];

const ExtraStats = () => {
  const [selectedRange, setSelectedRange] = useState(timeRanges[0].value);
  const data = useHomePageExtraStats(selectedRange);

  const handleTimeRangeChange = (value: string | number) => {
    setSelectedRange(value);
  };

  return (
    <StyledCard>
      <ExtraStatsDisplay
        title="Activity"
        text={
          <DropdownSelect
            smallButton
            simpleButton
            items={timeRanges.map((range) => ({
              value: range.value,
              text: range.text,
            }))}
            defaultValue={selectedRange}
            callback={handleTimeRangeChange}
          />
        }
        icon={LawBalance}
      />
      {stats.map(({ title, getText, icon }, i) => (
        <ExtraStatsDisplay key={i} {...{ title, icon }} text={getText(data)} />
      ))}
    </StyledCard>
  );
};

export default ExtraStats;
