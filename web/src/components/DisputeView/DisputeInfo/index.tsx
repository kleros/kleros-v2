import React, { useMemo } from "react";

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

const getPeriodPhrase = (period: Periods): string => {
  switch (period) {
    case Periods.evidence:
      return "Voting Starts";
    case Periods.appeal:
      return "Appeal Deadline";
    case Periods.execution:
      return "Final Decision";
    default:
      return "Voting Deadline";
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
  const { isList } = useIsList();
  const { isDisconnected } = useAccount();
  const displayAsList = isList && !overrideIsList;

  const fieldItems: FieldItem[] = useMemo(
    () => [
      {
        icon: LawBalanceIcon,
        name: "Court",
        value: court,
        link: `/courts/${courtId}`,
        display: !isUndefined(court) && !isUndefined(courtId),
      },
      {
        icon: RoundIcon,
        name: "Round",
        value: round?.toString(),
        display: !isUndefined(round),
      },
      {
        icon: BookmarkIcon,
        name: "Category",
        value: category ?? "General",
        display: true,
        style: "justify-self: end;",
      },
      { icon: PileCoinsIcon, name: "Juror Rewards", value: rewards, display: !isUndefined(rewards) },
      {
        icon: CalendarIcon,
        name: getPeriodPhrase(period ?? 0),
        value: !displayAsList ? new Date(date * 1000).toLocaleString() : formatDate(date),
        display: !isUndefined(period) && !isUndefined(date),
        style: "grid-column: 2 / 4;",
      },
    ],
    [category, court, courtId, date, displayAsList, isOverview, period, rewards, round]
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
