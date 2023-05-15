import { Periods } from "consts/periods";
import React from "react";
import styled from "styled-components";
import BookmarkIcon from "svgs/icons/bookmark.svg";
import CalendarIcon from "svgs/icons/calendar.svg";
import LawBalanceIcon from "svgs/icons/law-balance.svg";
import PileCoinsIcon from "svgs/icons/pile-coins.svg";
import Field from "../Field";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}

const DisputeInfo: React.FC<IDisputeInfo> = ({ courtId, court, category, rewards, period, date }) => {
  return (
    <Container>
      {category && <Field icon={BookmarkIcon} name="Category" value={category} />}
      {court && courtId && <Field icon={LawBalanceIcon} name="Court" value={court} link={`/courts/${courtId}`} />}
      {rewards && <Field icon={PileCoinsIcon} name="Juror Rewards" value={rewards} />}
      {typeof period !== "undefined" && date && (
        <Field icon={CalendarIcon} name={getPeriodPhrase(period)} value={new Date(date * 1000).toLocaleString()} />
      )}
    </Container>
  );
};
export default DisputeInfo;
