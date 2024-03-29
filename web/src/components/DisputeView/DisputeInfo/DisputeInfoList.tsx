import React from "react";
import styled from "styled-components";

import Field, { IField } from "components/Field";

import CardLabel from "../CardLabels";

import { FieldItem, IDisputeInfo } from ".";

const Container = styled.div<{ isLabel?: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  justify-content: ${({ isLabel }) => (isLabel ? "space-between" : "flex-end")};
  flex: 0 1 450px;
  align-items: center;
`;

const RestOfFieldsContainer = styled.div`
  gap: 8px;
  align-items: center;
  height: min-content;
  width: max-content;
  display: grid;
  grid-template-columns: repeat(3, min-content);
  justify-content: start;
`;
const StyledField = styled(Field)<{ style?: string }>`
  ${({ style }) => style ?? ""}
`;
type IDisputeInfoList = { fieldItems: FieldItem[] } & IDisputeInfo;
const DisputeInfoList: React.FC<IDisputeInfoList> = ({ fieldItems, showLabels, disputeID, round }) => {
  return (
    <Container isLabel={showLabels}>
      <RestOfFieldsContainer>
        {fieldItems.map((item) =>
          item.display ? <StyledField key={item.name} {...(item as IField)} displayAsList /> : null
        )}
      </RestOfFieldsContainer>
      {showLabels ? <CardLabel disputeId={disputeID} round={round - 1} isList /> : null}
    </Container>
  );
};
export default DisputeInfoList;
