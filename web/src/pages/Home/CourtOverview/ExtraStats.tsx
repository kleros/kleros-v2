import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import LawBalance from "svgs/icons/law-balance.svg";
import LongArrowUp from "svgs/icons/long-arrow-up.svg";

import { useHomePageExtraStats } from "hooks/queries/useHomePageExtraStats";
import type { SelectItem } from "utils/uiComponentsTypes";

import ExtraStatsDisplay from "components/ExtraStatsDisplay";
import { LabeledDropdownSelect } from "components/LabeledDropdown";

type HomePageExtraStatsResult = ReturnType<typeof useHomePageExtraStats>;

interface IStat {
  title: string;
  getText: (data: HomePageExtraStatsResult) => string | null | undefined;
  getCourtId: (data: HomePageExtraStatsResult) => string | undefined;
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

  const handleTimeRangeChange = (item: SelectItem) => {
    setSelectedRange(item.itemValue);
  };

  return (
    <div className="flex flex-wrap gap-[12px_16px] justify-center items-center mt-3 lg:mt-4 lg:gap-[16px_24px]">
      <ExtraStatsDisplay
        title={t("stats.activity")}
        content={
          <LabeledDropdownSelect
            ariaLabel={t("aria_labels.time_range")}
            smallButton
            simpleButton
            items={timeRanges.map((range) => ({
              id: range.value,
              itemValue: range.value,
              text: range.text,
            }))}
            defaultSelectedKey={selectedRange}
            callback={handleTimeRangeChange}
          />
        }
        icon={LawBalance}
      />
      {data.data?.mostDisputedCourt?.numberDisputes === 0 ? (
        <label className="text-[14px] font-semibold">{t("stats.no_activity_in_this_period")}</label>
      ) : (
        stats.map(({ title, getCourtId, getText, icon }) => (
          <ExtraStatsDisplay
            key={title}
            courtId={getCourtId(data)}
            {...{ title, icon }}
            text={getText(data) ?? undefined}
          />
        ))
      )}
    </div>
  );
};

export default ExtraStats;
