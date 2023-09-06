import React from "react";
import styled from "styled-components";
import { Periods } from "consts/periods";
import BookmarkIcon from "svgs/icons/bookmark.svg";
import CalendarIcon from "svgs/icons/calendar.svg";
import LawBalanceIcon from "svgs/icons/law-balance.svg";
import PileCoinsIcon from "svgs/icons/pile-coins.svg";
import Field from "../Field";

const Container = styled.div<{ isCard: boolean }>`
  display: flex;
  flex-direction: ${({ isCard }) => (isCard ? "column" : "row")};
  gap: ${({ isCard }) => (isCard ? "8px" : "48px")};
  justify-content: ${({ isCard }) => (isCard ? "center" : "space-between")};
  align-items: center;
  width: 100%;
  height: 100%;
`;

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

export interface IDisputeInfo {
  courtId?: string;
  court?: string;
  category?: string;
  rewards?: string;
  period?: Periods;
  date?: number;
  isCard?: boolean;
}

const formatDate = (date: number) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  const startingDate = new Date(date * 1000);
  const formattedDate = startingDate.toLocaleDateString("en-US", options);
  return formattedDate;
};

const DisputeInfo: React.FC<IDisputeInfo> = ({ courtId, court, category, rewards, period, date, isCard = true }) => {
  return (
    <Container isCard={isCard}>
      {court && courtId && (
        <Field isCard={false} icon={LawBalanceIcon} name="Court" value={court} link={`/courts/${courtId}`} />
      )}
      {category && <Field isCard={false} icon={BookmarkIcon} name="Category" value={category} />}
      {rewards && <Field isCard={false} icon={PileCoinsIcon} name="Juror Rewards" value={rewards} />}
      {typeof period !== "undefined" && date && (
        <Field
          isCard={false}
          icon={CalendarIcon}
          name={getPeriodPhrase(period)}
          value={isCard ? new Date(date * 1000).toLocaleString() : formatDate(date)}
        />
      )}
    </Container>
  );
};
export default DisputeInfo;
