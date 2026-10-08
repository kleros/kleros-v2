import React from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";

import { Card } from "@kleros/ui-components-library";

import { Periods } from "consts/periods";
import useTheme from "hooks/useTheme";
import { cn } from "utils/cn";
import { formatDate } from "utils/date";
import { isUndefined } from "utils/index";

import { BREAKPOINT_LANDSCAPE } from "styles/breakpoints";
import { responsiveSize } from "styles/responsiveSize";

import { InternalLink } from "components/InternalLink";
import { StyledSkeleton } from "components/StyledSkeleton";

import CardLabel from "./CardLabels";
import { getPeriodPhrase } from "./DisputeInfo";
import { getPeriodColors, getPeriodLabel } from "./PeriodBanner";

const fromLandscape = (min: number, max: number) => responsiveSize(min, max, BREAKPOINT_LANDSCAPE);

interface IDisputeListView {
  title: string;
  disputeID?: string;
  courtId?: string;
  court?: string;
  category?: string;
  rewards?: string;
  period?: Periods;
  date?: number;
  round?: number;
  isLoading?: boolean;
}

const DisputeListView: React.FC<IDisputeListView> = ({
  title,
  disputeID,
  courtId,
  court,
  category,
  rewards,
  period,
  date,
  round,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { isDisconnected } = useAccount();

  const accent = isUndefined(period) ? theme.stroke : getPeriodColors(period, theme)[0];
  const label =
    !isDisconnected && !isUndefined(disputeID) && !isUndefined(round) ? (
      <CardLabel disputeId={disputeID} round={round - 1} asPill />
    ) : null;

  return (
    <Link to={`/cases/${disputeID?.toString()}`} className={cn("block", label ? "mt-3" : "mt-0")}>
      <Card
        hover
        className="relative grid h-auto w-full items-center border-l-[3px] border-solid [transition:0.1s]"
        style={{
          borderLeftColor: accent,
          gridTemplateColumns: `minmax(0, 1fr) ${fromLandscape(180, 300)}`,
          gap: fromLandscape(20, 32),
          padding: `${fromLandscape(16, 18)} ${fromLandscape(20, 24)}`,
        }}
      >
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="shrink-0 text-[14px] text-klerosUIComponentsSecondaryText tabular-nums">#{disputeID}</span>
            {isLoading ? (
              <StyledSkeleton width={220} height={18} />
            ) : (
              <h3 dir="auto" className="m-0 min-w-0 truncate leading-6" style={{ fontSize: fromLandscape(16, 18) }}>
                {title}
              </h3>
            )}
            {!isUndefined(period) ? (
              <span className="shrink-0 text-[13px] font-semibold whitespace-nowrap" style={{ color: accent }}>
                {getPeriodLabel(period, false, t)}
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              "flex min-w-0 items-center gap-2.5 whitespace-nowrap text-klerosUIComponentsSecondaryText",
              "[&_a]:shrink-0 [&_a]:text-[length:inherit] [&>*+*]:before:mr-2.5",
              "[&>*+*]:before:text-klerosUIComponentsStroke [&>*+*]:before:content-['·']"
            )}
            style={{ fontSize: fromLandscape(12, 13) }}
          >
            {!isUndefined(court) && !isUndefined(courtId) ? (
              <InternalLink to={`/courts/${courtId}`} onClick={(event) => event.stopPropagation()}>
                {court}
              </InternalLink>
            ) : null}
            {!isUndefined(round) ? (
              <span className="shrink-0 tabular-nums">{t("dispute_info.round_number", { round })}</span>
            ) : null}
            <span className="min-w-0 overflow-hidden text-ellipsis">{category ?? t("dispute_info.general")}</span>
            {!isUndefined(rewards) ? <span className="shrink-0 tabular-nums">{rewards}</span> : null}
          </div>
        </div>

        {!isUndefined(period) && !isUndefined(date) ? (
          <div className="flex flex-col items-end justify-self-end gap-1 pr-2 whitespace-nowrap">
            <span className="text-[11px] tracking-[0.1em] text-klerosUIComponentsSecondaryText uppercase">
              {getPeriodPhrase(period, t)}
            </span>
            <span
              className="font-semibold text-klerosUIComponentsPrimaryText tabular-nums"
              style={{ fontSize: fromLandscape(14, 16) }}
            >
              {formatDate(date, false, i18n.language)}
            </span>
          </div>
        ) : null}

        {label ? <div className="absolute top-0 right-5 -translate-y-1/2">{label}</div> : null}
      </Card>
    </Link>
  );
};

export default DisputeListView;
