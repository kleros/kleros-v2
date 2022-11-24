import React from "react";
import styled from "styled-components";
import { Card as _Card, Breadcrumb } from "@kleros/ui-components-library";
import WithHelpTooltip from "../WithHelpTooltip";

const Card = styled(_Card)`
  height: auto;
  width: 100%;
  padding: 12px 24px;
  border-left: 5px solid ${({ theme }) => theme.secondaryPurple};
`;

const ValueContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  margin-bottom: 12px;
`;

const tooltipMsg =
  "When a juror is selected to arbitrate a case, part of their stake (PNK) is " +
  "locked until the case is resolved. Jurors whose vote is coherent with the " +
  "final jury decision have their locked stake released. Jurors whose vote " +
  "is not coherent with the final jury decision, lose their locked stake. " +
  "The locked stake of incoherent jurors is redistributed as incentives for " +
  "the coherent jurors.";

const CourtCard: React.FC = () => (
  <Card>
    <StyledBreadcrumb
      items={[
        { text: "General Court", value: 0 },
        { text: "Blockchain", value: 1 },
      ]}
    />
    <ValueContainer>
      <label> Stake: </label>
      <small>10,000 PNK</small>
    </ValueContainer>
    <ValueContainer>
      <WithHelpTooltip {...{ place: "bottom", tooltipMsg }}>
        <label> Locked Stake: </label>
      </WithHelpTooltip>
      <small> 1,000 PNK </small>
    </ValueContainer>
  </Card>
);

export default CourtCard;
