import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import LawBalanceIcon from "svgs/icons/law-balance.svg";

import { useCourtTree } from "hooks/queries/useCourtTree";

import { landscapeStyle } from "styles/landscapeStyle";

import Field, { IField } from "components/Field";
import { getCourtsPath } from "pages/Courts/CourtDetails";

import CardLabel from "../CardLabels";

import { FieldItem, IDisputeInfo } from "./index";

const Container = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
  flex-direction: column;
  justify-content: flex-end;
`;

const CourtBranchFieldContainer = styled.div`
  display: flex;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const RestOfFieldsContainer = styled.div<{ isOverview?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

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

const StyledField = styled(Field)`
  max-width: 100%;
  label {
    &.value {
      margin-left: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: auto;
    }
  }
`;

type IDisputeInfoCard = { fieldItems: FieldItem[] } & IDisputeInfo;

const DisputeInfoCard: React.FC<IDisputeInfoCard> = ({
  isOverview,
  showLabels,
  fieldItems,
  court,
  courtId,
  disputeID,
  round,
}) => {
  const { data } = useCourtTree();
  const courtPath = getCourtsPath(data?.court, courtId);
  const items = useMemo(
    () => [...(courtPath?.map((node) => ({ text: node.name, value: node.id })) ?? [])],
    [courtPath]
  );

  const courtBranchValue = items.map((item) => item.text).join(" / ");
  return (
    <Container>
      {court && courtId && isOverview && (
        <CourtBranchFieldContainer>
          <StyledField
            link={`/courts/${courtId}`}
            icon={LawBalanceIcon}
            name="Court Branch"
            value={courtBranchValue}
            {...{ isOverview }}
          />
        </CourtBranchFieldContainer>
      )}
      <RestOfFieldsContainer {...{ isOverview }}>
        {fieldItems.map((item) =>
          item.display ? <StyledField key={item.name} {...(item as IField)} {...{ isOverview }} /> : null
        )}
      </RestOfFieldsContainer>
      {showLabels ? <CardLabel disputeId={disputeID} round={round - 1} /> : null}
    </Container>
  );
};
export default DisputeInfoCard;
