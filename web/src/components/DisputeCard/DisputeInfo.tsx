import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Periods } from "consts/periods";
import { useIsList } from "context/IsListProvider";
import BookmarkIcon from "svgs/icons/bookmark.svg";
import CalendarIcon from "svgs/icons/calendar.svg";
import LawBalanceIcon from "svgs/icons/law-balance.svg";
import PileCoinsIcon from "svgs/icons/pile-coins.svg";
import RoundIcon from "svgs/icons/round.svg";
import Field, { IField } from "../Field";
import { getCourtsPath } from "pages/Courts/CourtDetails";
import { useCourtTree } from "hooks/queries/useCourtTree";
import { responsiveSize } from "styles/responsiveSize";
import CardLabel from "./CardLabels";
import { useAccount } from "wagmi";
import { formatDate } from "utils/date";
import { isUndefined } from "utils/index";

const Container = styled.div<{ isList: boolean; isOverview?: boolean; isLabel?: boolean }>`
  display: flex;
  width: 100%;
  gap: 8px;
  flex-direction: column;
  justify-content: flex-end;
  ${({ isList, isLabel }) =>
    isList &&
    css`
      ${landscapeStyle(
        () => css`
          height: 100%;
          flex-direction: row;
          justify-content: ${isLabel ? "space-between" : "flex-end"};
          flex: 0 1 450px;
          align-items: center;
          margin-right: ${responsiveSize(7, 15, 900)};
        `
      )}
    `};
`;

const CourtBranchFieldContainer = styled.div`
  display: flex;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const RestOfFieldsContainer = styled.div<{ isList?: boolean; isOverview?: boolean }>`
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
          height: min-content;
          width: max-content;
          display: grid;
          grid-template-columns: min-content 80px min-content;
          justify-content: start;
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
        `
      )}
    `};
`;

const StyledField = styled(Field)<{ style?: string }>`
  ${({ style }) => (style ? style : "")}
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
  const { data } = useCourtTree();
  const courtPath = getCourtsPath(data?.court, courtId);
  const items = useMemo(
    () => [...(courtPath?.map((node) => ({ text: node.name, value: node.id })) ?? [])],
    [courtPath]
  );

  const courtBranchValue = items.map((item) => item.text).join(" / ");
  const fieldItems = useMemo(
    () => [
      {
        icon: LawBalanceIcon,
        name: "Court",
        value: court,
        link: `/courts/${courtId}`,
        display: court && courtId && !isOverview,
      },
      { icon: BookmarkIcon, name: "Category", value: category ?? "General", display: true },
      { icon: RoundIcon, name: "Round", value: round?.toString(), display: round, style: "justify-self: end;" },
      { icon: PileCoinsIcon, name: "Juror Rewards", value: rewards, display: rewards },
      {
        icon: CalendarIcon,
        name: getPeriodPhrase(period ?? 0),
        value: !displayAsList ? new Date(date * 1000).toLocaleString() : formatDate(date),
        display: !isUndefined(period) && date,
        style: "grid-column: 2 / 4;",
      },
    ],
    [category, court, courtId, date, displayAsList, isOverview, period, rewards, round]
  );
  return (
    <Container isList={displayAsList} isOverview={isOverview} isLabel={!isDisconnected}>
      {court && courtId && isOverview && (
        <CourtBranchFieldContainer>
          <Field
            icon={LawBalanceIcon}
            name="Court Branch"
            value={courtBranchValue}
            {...{ displayAsList, isOverview }}
          />
        </CourtBranchFieldContainer>
      )}
      <RestOfFieldsContainer isOverview={isOverview} isList={displayAsList}>
        {fieldItems.map((item) =>
          item.display ? <StyledField key={item.name} {...(item as IField)} {...{ displayAsList, isOverview }} /> : null
        )}
      </RestOfFieldsContainer>
      {showLabels && !isDisconnected ? (
        <CardLabel disputeId={disputeID} round={round - 1} isList={displayAsList} />
      ) : null}
    </Container>
  );
};
export default DisputeInfo;
