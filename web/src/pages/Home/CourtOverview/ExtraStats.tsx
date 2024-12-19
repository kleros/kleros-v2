import React, { useState } from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import { DropdownSelect } from "@kleros/ui-components-library";

import LawBalance from "svgs/icons/law-balance.svg";
import LongArrowUp from "svgs/icons/long-arrow-up.svg";

import { useHomePageExtraStats } from "hooks/queries/useHomePageExtraStats";

import ExtraStatsDisplay from "components/ExtraStatsDisplay";

const StyledCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  justify-content: center;
  margin-top: 12px;

  ${landscapeStyle(
    () => css`
      margin-top: 16px;
      gap: 16px 24px;
    `
  )}
`;

const StyledLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
`;

interface IStat {
  title: string;
  getText: (data) => string;
  getCourtId: (data) => string;
  icon: React.FC<React.SVGAttributes<SVGElement>>;
}

const stats: IStat[] = [
  {
    title: "Most Cases",
    getText: ({ data }) => data?.mostDisputedCourt?.name,
    getCourtId: ({ data }) => data?.mostDisputedCourt?.id,
    icon: LongArrowUp,
  },
  {
    title: "Highest drawing chance",
    getText: ({ data }) => data?.bestDrawingChancesCourt?.name,
    getCourtId: ({ data }) => data?.bestDrawingChancesCourt?.id,
    icon: LongArrowUp,
  },
  {
    title: "Highest rewards chance",
    getText: ({ data }) => data?.bestExpectedRewardCourt?.name,
    getCourtId: ({ data }) => data?.bestExpectedRewardCourt?.id,
    icon: LongArrowUp,
  },
];

const timeRanges = [
  { value: 7, text: "Last 7 days" },
  { value: 30, text: "Last 30 days" },
  { value: 180, text: "Last 180 days" },
  { value: "allTime", text: "All Time" },
];

const ExtraStats = () => {
  const [selectedRange, setSelectedRange] = useState(timeRanges[1].value);
  const data = useHomePageExtraStats(selectedRange);

  const handleTimeRangeChange = (value: string | number) => {
    setSelectedRange(value);
  };

  return (
    <StyledCard>
      <ExtraStatsDisplay
        title="Activity"
        content={
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
      {data.data?.mostDisputedCourt?.numberDisputes === 0 ? (
        <StyledLabel>No activity in this period</StyledLabel>
      ) : (
        stats.map(({ title, getCourtId, getText, icon }) => (
          <ExtraStatsDisplay key={title} courtId={getCourtId(data)} {...{ title, icon }} text={getText(data)} />
        ))
      )}
    </StyledCard>
  );
};

export default ExtraStats;
