import React from "react";
import styled, { css } from "styled-components";
import { smallScreenStyle } from "styles/smallScreenStyle";
import WithHelpTooltip from "pages/Dashboard/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 40vw;
  width: 100%;
`;

const CasesData = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 48px;
  flex-wrap: wrap;
  padding: 0 4%;
  justify-content: space-between;
  ${smallScreenStyle(css`
    margin-left: calc(0px + (33) * (100vw - 370px) / (1250 - 370));
    gap: 12px;
  `)}
`;

const CategoryLabel = styled.label`
  margin-left: 32px;
`;

const RewardsContainer = styled.div`
  margin-right: -16px;
`;

const CaseTitle = styled.div`
  display: flex;
  margin-left: 32px;
  gap: 36px;
  label {
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: ${({ theme }) => theme.secondaryText} !important;
  }

  ${smallScreenStyle(css`
    display: none;
  `)}
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
        <label>Court</label>
        <CategoryLabel>Category</CategoryLabel>
        <RewardsContainer>
          <WithHelpTooltip place="top" {...{ tooltipMsg }}>
            <label> Rewards: </label>
          </WithHelpTooltip>
        </RewardsContainer>
        <label>Next Deadline</label>
      </CasesData>
    </Container>
  );
};

export default CasesListHeader;
