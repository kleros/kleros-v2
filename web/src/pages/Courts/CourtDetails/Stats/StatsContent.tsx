import React from "react";

import { useTranslation } from "react-i18next";

import ChartIcon from "svgs/icons/chart.svg";

import { Prices } from "hooks/useCoinPrice";
import { calculateSubtextRender } from "utils/calculateSubtextRender";
import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

import { CourtDetailsQuery } from "queries/useCourtDetails";

import StatDisplay from "components/StatDisplay";
import { StyledSkeleton } from "components/StyledSkeleton";

import { getStats } from "./stats";

const TimeDisplayContainer = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  function TimeDisplayContainer({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cn("flex flex-row items-center gap-2", className)} />;
  }
);

const StatsContent: React.FC<{ court: CourtDetailsQuery["court"]; pricesData?: Prices; coinIds: string[] }> = ({
  court,
  pricesData,
  coinIds,
}) => {
  const { t } = useTranslation();
  const stats = getStats(t);

  return (
    <div className="flex flex-col gap-1">
      <div>
        <TimeDisplayContainer className="p-[calc(12px_+_(16_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_0]">
          <ChartIcon className="[&_path]:fill-klerosUIComponentsPrimaryText" />
          <p className="text-klerosUIComponentsPrimaryText m-0 text-[14px]">{t("timeline.parameters")}</p>
        </TimeDisplayContainer>
        <div className="flex flex-wrap gap-[20px_0]">
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
        </div>
      </div>
      <div>
        <TimeDisplayContainer className="p-[calc(12px_+_(16_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_0]">
          <ChartIcon className="[&_path]:fill-klerosUIComponentsPrimaryText" />
          <p className="text-klerosUIComponentsPrimaryText m-0 text-[14px]">{t("stats.activity")}</p>
        </TimeDisplayContainer>
        <div className="flex flex-wrap gap-[20px_0]">
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
        </div>
      </div>
      <div>
        <TimeDisplayContainer className="p-[calc(12px_+_(16_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_0]">
          <ChartIcon className="[&_path]:fill-klerosUIComponentsPrimaryText" />
          <p className="text-klerosUIComponentsPrimaryText m-0 text-[14px]">{t("juror_levels.total_rewards")}</p>
        </TimeDisplayContainer>
        <div className="flex flex-wrap gap-[20px_0]">
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
        </div>
      </div>
    </div>
  );
};

export default StatsContent;
