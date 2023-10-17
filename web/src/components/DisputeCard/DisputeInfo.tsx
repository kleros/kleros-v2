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
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div<{ isList: boolean; isOverview?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  ${({ isList }) =>
    isList &&
    css`
      ${landscapeStyle(
        () => css`
          flex-direction: row;
          gap: calc(4px + (24px - 4px) * ((100vw - 300px) / (900 - 300)));
          justify-content: space-around;
        `
      )}
    `};

  ${({ isOverview }) =>
    isOverview &&
    css`
      ${landscapeStyle(
        () => css`
          margin-top: 16px;
          gap: 32px;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: flex-start;
          align-items: flex-start;
        `
      )}
    `};
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
  isOverview?: boolean;
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
  isOverview,
}) => {
  const { isList } = useIsList();
  const displayAsList = isList && !overrideIsList;

  return (
    <Container isList={displayAsList} isOverview={isOverview}>
      {court && courtId && (
        <Field
          icon={LawBalanceIcon}
          name="Court"
          value={court}
          link={`/courts/${courtId}`}
          displayAsList={displayAsList}
          isOverview={isOverview}
        />
      )}
      {category && (
        <Field
          icon={BookmarkIcon}
          name="Category"
          value={category}
          displayAsList={displayAsList}
          isOverview={isOverview}
        />
      )}
      {!category && displayAsList && (
        <Field
          icon={BookmarkIcon}
          name="Category"
          value="General"
          displayAsList={displayAsList}
          isOverview={isOverview}
        />
      )}
      {round && (
        <Field
          icon={RoundIcon}
          name="Round"
          value={round.toString()}
          displayAsList={displayAsList}
          isOverview={isOverview}
        />
      )}
      {rewards && (
        <Field
          icon={PileCoinsIcon}
          name="Juror Rewards"
          value={rewards}
          displayAsList={displayAsList}
          isOverview={isOverview}
        />
      )}
      {typeof period !== "undefined" && date && (
        <Field
          icon={CalendarIcon}
          name={getPeriodPhrase(period)}
          value={!displayAsList ? new Date(date * 1000).toLocaleString() : formatDate(date)}
          displayAsList={displayAsList}
          isOverview={isOverview}
        />
      )}
    </Container>
  );
};
export default DisputeInfo;
