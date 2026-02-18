import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import BookmarkIcon from "svgs/icons/bookmark.svg";
import CalendarIcon from "svgs/icons/calendar.svg";
import LawBalanceIcon from "svgs/icons/law-balance.svg";
import PileCoinsIcon from "svgs/icons/pile-coins.svg";
import RoundIcon from "svgs/icons/round.svg";

import { Periods } from "consts/periods";
import { useIsList } from "context/IsListProvider";
import { formatDate } from "utils/date";
import { isUndefined } from "utils/index";

import DisputeInfoCard from "./DisputeInfoCard";
import DisputeInfoList from "./DisputeInfoList";

const getPeriodPhrase = (period: Periods, t: (key: string) => string): string => {
  switch (period) {
    case Periods.evidence:
      return t("dispute_info.voting_starts");
    case Periods.appeal:
      return t("dispute_info.appeal_deadline");
    case Periods.execution:
      return t("dispute_info.final_decision");
    default:
      return t("dispute_info.voting_deadline");
  }
};

export type FieldItem = {
  icon: React.FC<React.SVGAttributes<SVGElement>>;
  name: string;
  value?: string;
  link?: string;
  display: boolean;
  style?: string;
};

export interface IDisputeInfo {
  disputeID?: string;
  courtId?: string;
  court?: string;
  category?: string;
  rewards?: string;
  period?: Periods;
  date?: number;
  round?: number;
  overrideIsList?: boolean;
  isOverview?: boolean;
  showLabels?: boolean;
}

const DisputeInfo: React.FC<IDisputeInfo> = ({
  disputeID,
  courtId,
  court,
  category,
  rewards,
  period,
  date,
  round,
  overrideIsList,
  isOverview,
  showLabels = false,
}) => {
  const { t, i18n } = useTranslation();
  const { isList } = useIsList();
  const { isDisconnected } = useAccount();
  const displayAsList = isList && !overrideIsList;

  const fieldItems: FieldItem[] = useMemo(
    () => [
      {
        icon: LawBalanceIcon,
        name: t("dispute_info.court"),
        value: court,
        link: `/courts/${courtId}`,
        display: !isUndefined(court) && !isUndefined(courtId),
      },
      {
        icon: RoundIcon,
        name: t("dispute_info.round"),
        value: round?.toString(),
        display: !isUndefined(round),
      },
      {
        icon: BookmarkIcon,
        name: t("dispute_info.category"),
        value: category ?? t("dispute_info.general"),
        display: true,
        style: "justify-self: end;",
      },
      { icon: PileCoinsIcon, name: t("dispute_info.juror_rewards"), value: rewards, display: !isUndefined(rewards) },
      {
        icon: CalendarIcon,
        name: getPeriodPhrase(period ?? 0, t),
        value: date
          ? !displayAsList
            ? new Date(date * 1000).toLocaleString(i18n.language)
            : formatDate(date, false, i18n.language)
          : "",
        display: !isUndefined(period) && !isUndefined(date),
        style: "grid-column: 2 / 4;",
      },
    ],
    [category, court, courtId, date, displayAsList, period, rewards, round, t, i18n.language]
  );
  return displayAsList ? (
    <DisputeInfoList showLabels={showLabels && !isDisconnected} {...{ disputeID, round, fieldItems }} />
  ) : (
    <DisputeInfoCard
      showLabels={showLabels && !isDisconnected}
      {...{ disputeID, round, fieldItems, court, courtId, isOverview }}
    />
  );
};
export default DisputeInfo;
