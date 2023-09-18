import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import WithHelpTooltip from "pages/Dashboard/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  gap: calc(15vw + (40 - 15) * ((100vw - 300px) / (1250 - 300)));
  width: 100%;
  height: 100%;
`;

const CasesData = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  margin-left: calc(0px + (33) * (100vw - 370px) / (1250 - 370));
  flex-wrap: wrap;
  padding: 0 3%;
  gap: calc(24px + (48 - 24) * ((100vw - 300px) / (1250 - 300)));
`;

const CaseTitle = styled.div`
  display: none;
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

const StyledLabel = styled.label`
  padding-left: calc(4px + (8 - 4) * ((100vw - 300px) / (900 - 300)));
`;

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
