import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import Field, { IField } from "components/Field";

import CardLabel from "../CardLabels";

import { FieldItem, IDisputeInfo } from "./index";

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: flex-end;
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
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: auto;
    }
  }
`;

type IDisputeInfoCard = { fieldItems: FieldItem[] } & IDisputeInfo;

const DisputeInfoCard: React.FC<IDisputeInfoCard> = ({ isOverview, showLabels, fieldItems, disputeID, round }) => {
  return (
    <Container>
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
