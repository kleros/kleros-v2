import React, { useMemo } from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import Field, { IField } from "components/Field";

import CardLabel from "../CardLabels";

import { FieldItem, IDisputeInfo } from ".";

const Container = styled.div<{ isLabel?: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  justify-content: ${({ isLabel }) => (isLabel ? "space-between" : "flex-end")};
  flex: 0 1 ${responsiveSize(400, 450, 900)};
  align-items: center;
  padding-right: ${responsiveSize(12, 24, 900)};
  gap: 8px;
`;

const RestOfFieldsContainer = styled.div`
  gap: 8px ${responsiveSize(8, 32, 900)};
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

const truncateText = (text: string, limit: number) => {
  if (text && text.length > limit) {
    return text.substring(0, limit) + "...";
  }
  return text;
};

type IDisputeInfoList = { fieldItems: FieldItem[] } & IDisputeInfo;
const DisputeInfoList: React.FC<IDisputeInfoList> = ({ fieldItems, showLabels, disputeID, round }) => {
  const FieldItems = useMemo(
    () =>
      fieldItems.map((item) =>
        item.display ? (
          <StyledField key={item.name} {...(item as IField)} value={truncateText(item.value, 20)} displayAsList />
        ) : null
      ),
    [fieldItems]
  );

  return (
    <Container isLabel={showLabels}>
      <RestOfFieldsContainer>{FieldItems}</RestOfFieldsContainer>
      {showLabels ? <CardLabel disputeId={disputeID} round={round - 1} isList /> : null}
    </Container>
  );
};
export default DisputeInfoList;
