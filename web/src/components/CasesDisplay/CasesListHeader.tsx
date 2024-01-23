import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import WithHelpTooltip from "components/WithHelpTooltip";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;
`;

const CasesData = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: repeat(4, ${responsiveSize(100, 130, 900)});
  column-gap: ${responsiveSize(2, 12, 900)};
  justify-content: space-between;
  margin-right: 8px;
`;

const CaseTitle = styled.div`
  display: none;
  width: ${responsiveSize(270, 345, 900)};
  margin-left: 32px;
  gap: 36px;
  label {
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: ${({ theme }) => theme.secondaryText} !important;
  }

  ${landscapeStyle(
    () =>
      css`
        display: flex;
      `
  )}
`;

const StyledLabel = styled.label``;

const tooltipMsg =
  "Users have an economic interest in serving as jurors in Kleros: " +
  "collecting the Juror Rewards in exchange for their work. Each juror who " +
  "is coherent with the final ruling receive the Juror Rewards composed of " +
  "arbitration fees (ETH) + PNK redistribution between jurors.";

const CasesListHeader: React.FC = () => {
  return (
    <Container>
      <CaseTitle>
        <label>#</label>
        <label>Title</label>
      </CaseTitle>
      <CasesData>
        <StyledLabel>Court</StyledLabel>
        <StyledLabel>Category</StyledLabel>
        <WithHelpTooltip place="top" {...{ tooltipMsg }}>
          <label> Rewards: </label>
        </WithHelpTooltip>
        <label>Next Deadline</label>
      </CasesData>
    </Container>
  );
};

export default CasesListHeader;
