import React from "react";
import styled, { css } from "styled-components";
import { useFiltersContext } from "context/FilterProvider";
import { Periods } from "consts/periods";
import BookmarkIcon from "svgs/icons/bookmark.svg";
import CalendarIcon from "svgs/icons/calendar.svg";
import LawBalanceIcon from "svgs/icons/law-balance.svg";
import PileCoinsIcon from "svgs/icons/pile-coins.svg";
import RoundIcon from "svgs/icons/round.svg";
import Field from "../Field";

const Container = styled.div<{ isList: boolean }>`
  display: flex;
  flex-direction: ${({ isList }) => (isList ? "row" : "column")};
  gap: 8px;

  ${({ isList }) =>
    isList &&
    css`
      gap: calc(4px + (24px - 4px) * ((100vw - 300px) / (900 - 300)));
    `};
  justify-content: ${({ isList }) => (isList ? "space-around" : "center")};
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
  round?: number;
}

const formatDate = (date: number) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  const startingDate = new Date(date * 1000);
  const formattedDate = startingDate.toLocaleDateString("en-US", options);
  return formattedDate;
};

const DisputeInfo: React.FC<IDisputeInfo> = ({ courtId, court, category, rewards, period, date, round }) => {
  const { isList } = useFiltersContext();

  return (
    <Container isList={isList}>
      {court && courtId && <Field icon={LawBalanceIcon} name="Court" value={court} link={`/courts/${courtId}`} />}
      {category && <Field icon={BookmarkIcon} name="Category" value={category} />}
      {!category && isList && <Field icon={BookmarkIcon} name="Category" value="General" />}
      {round && <Field icon={RoundIcon} name="Round" value={round.toString()} />}
      {rewards && <Field icon={PileCoinsIcon} name="Juror Rewards" value={rewards} />}
      {typeof period !== "undefined" && date && (
        <Field
          icon={CalendarIcon}
          name={getPeriodPhrase(period)}
          value={!isList ? new Date(date * 1000).toLocaleString() : formatDate(date)}
        />
      )}
    </Container>
  );
};
export default DisputeInfo;
