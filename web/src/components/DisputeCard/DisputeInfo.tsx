import React from "react";
import styled, { css } from "styled-components";
import { Periods } from "consts/periods";
import { useIsList } from "context/IsListProvider";
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
  overrideIsList?: boolean;
}

const formatDate = (date: number) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  const startingDate = new Date(date * 1000);
  const formattedDate = startingDate.toLocaleDateString("en-US", options);
  return formattedDate;
};

const DisputeInfo: React.FC<IDisputeInfo> = ({
  courtId,
  court,
  category,
  rewards,
  period,
  date,
  round,
  overrideIsList,
}) => {
  const { isList } = useIsList();
  const displayAsList = isList && !overrideIsList;

  return (
    <Container isList={displayAsList}>
      {court && courtId && (
        <Field
          icon={LawBalanceIcon}
          name="Court"
          value={court}
          link={`/courts/${courtId}`}
          displayAsList={displayAsList}
        />
      )}
      {category && <Field icon={BookmarkIcon} name="Category" value={category} displayAsList={displayAsList} />}
      {!category && displayAsList && (
        <Field icon={BookmarkIcon} name="Category" value="General" displayAsList={displayAsList} />
      )}
      {round && <Field icon={RoundIcon} name="Round" value={round.toString()} displayAsList={displayAsList} />}
      {rewards && <Field icon={PileCoinsIcon} name="Juror Rewards" value={rewards} displayAsList={displayAsList} />}
      {typeof period !== "undefined" && date && (
        <Field
          icon={CalendarIcon}
          name={getPeriodPhrase(period)}
          value={!displayAsList ? new Date(date * 1000).toLocaleString() : formatDate(date)}
          displayAsList={displayAsList}
        />
      )}
    </Container>
  );
};
export default DisputeInfo;
