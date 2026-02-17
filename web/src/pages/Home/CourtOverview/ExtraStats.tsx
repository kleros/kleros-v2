import React, { useState } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { DropdownSelect } from "@kleros/ui-components-library";

import LawBalance from "svgs/icons/law-balance.svg";
import LongArrowUp from "svgs/icons/long-arrow-up.svg";

import { useHomePageExtraStats } from "hooks/queries/useHomePageExtraStats";

import { landscapeStyle } from "styles/landscapeStyle";

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

const ExtraStats = () => {
  const { t } = useTranslation();

  const stats: IStat[] = [
    {
      title: t("stats.most_cases"),
      getText: ({ data }) => data?.mostDisputedCourt?.name,
      getCourtId: ({ data }) => data?.mostDisputedCourt?.id,
      icon: LongArrowUp,
    },
    {
      title: t("stats.highest_drawing_chance"),
      getText: ({ data }) => data?.bestDrawingChancesCourt?.name,
      getCourtId: ({ data }) => data?.bestDrawingChancesCourt?.id,
      icon: LongArrowUp,
    },
    {
      title: t("stats.highest_rewards_chance"),
      getText: ({ data }) => data?.bestExpectedRewardCourt?.name,
      getCourtId: ({ data }) => data?.bestExpectedRewardCourt?.id,
      icon: LongArrowUp,
    },
  ];

  const timeRanges = [
    { value: 7, text: t("time_ranges.last_7_days") },
    { value: 30, text: t("time_ranges.last_30_days") },
    { value: 180, text: t("time_ranges.last_180_days") },
    { value: "allTime", text: t("time_ranges.all_time") },
  ];

  const [selectedRange, setSelectedRange] = useState(timeRanges[1].value);
  const data = useHomePageExtraStats(selectedRange);

  const handleTimeRangeChange = (value: string | number) => {
    setSelectedRange(value);
  };

  return (
    <StyledCard>
      <ExtraStatsDisplay
        title={t("stats.activity")}
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
        <StyledLabel>{t("stats.no_activity_in_this_period")}</StyledLabel>
      ) : (
        stats.map(({ title, getCourtId, getText, icon }) => (
          <ExtraStatsDisplay key={title} courtId={getCourtId(data)} {...{ title, icon }} text={getText(data)} />
        ))
      )}
    </StyledCard>
  );
};

export default ExtraStats;
