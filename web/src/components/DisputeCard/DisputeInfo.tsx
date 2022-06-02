import React from "react";
import styled from "styled-components";
import { Periods } from "consts/periods";
import LawBalanceIcon from "svgs/icons/law-balance.svg";
import BookmarkIcon from "svgs/icons/bookmark.svg";
import PileCoinsIcon from "svgs/icons/pile-coins.svg";
import CalendarIcon from "svgs/icons/calendar.svg";

const FieldContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .value {
    flex-grow: 1;
    text-align: end;
    color: ${({ theme }) => theme.primaryText};
  }
  svg {
    fill: ${({ theme }) => theme.secondaryPurple};
    margin-right: 8px;
    width: 15px;
  }
`;

interface IField {
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  name: string;
  value: string;
}

const Field: React.FC<IField> = ({ icon: Icon, name, value }) => (
  <FieldContainer>
    {<Icon />}
    <label>{name}:</label>
    <label className="value">{value}</label>
  </FieldContainer>
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const getPeriodPhrase = (period: Periods) => {
  switch (period) {
    case Periods.appeal:
      return "Appeal Deadline";
    case Periods.execution:
      return "Final Decision";
    default:
      return "Voting Deadline";
  }
};

export interface IDisputeInfo {
  court: string;
  category: string;
  rewards: string;
  period: Periods;
  date: number;
}

const DisputeInfo: React.FC<IDisputeInfo> = ({
  court,
  category,
  rewards,
  period,
  date,
}) => (
  <Container>
    <Field icon={LawBalanceIcon} name="Court" value={court} />
    <Field icon={BookmarkIcon} name="Category" value={category} />
    <Field icon={PileCoinsIcon} name="Juror Rewards" value={rewards} />
    <Field
      icon={CalendarIcon}
      name={getPeriodPhrase(period)}
      value={new Date(date * 1000).toLocaleString()}
    />
  </Container>
);

export default DisputeInfo;
