import React from "react";
import styled, { css } from "styled-components";

import { Card, Checkbox } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { useCourtPolicy } from "queries/useCourtPolicy";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { DisputeContext } from "components/DisputePreview/DisputeContext";
import { Policies } from "components/DisputePreview/Policies";
import DisputeInfo from "components/DisputeView/DisputeInfo";
import { Divider } from "components/Divider";
import PlusMinusField from "components/PlusMinusField";
import WithHelpTooltip from "components/WithHelpTooltip";

import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  width: 100%;
  padding: 0px ${responsiveSize(10, 130)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
  min-height: 100px;
  position: relative;
`;

const PreviewContainer = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: ${responsiveSize(16, 32)};
  padding: ${responsiveSize(16, 32)};
`;

const Header = styled.h2`
  margin-bottom: 32px;
  width: 84vw;
  text-align: center;
  color: ${({ theme }) => theme.secondaryPurple};
  ${landscapeStyle(
    () => css`
      width: auto;
    `
  )}
`;

const BatchCreationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: start;
  align-self: flex-start;
  margin-bottom: ${responsiveSize(130, 70)};
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: start;
`;

const FieldLabel = styled.p`
  padding: 0;
  margin: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.secondaryText};
`;

const StyledPlusMinusField = styled(PlusMinusField)`
  margin: 0;
`;

const Overlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;

const Preview: React.FC = () => {
  const { disputeData, disputeTemplate, isBatchCreation, setIsBatchCreation, batchSize, setBatchSize } =
    useNewDisputeContext();
  const { data: courtPolicy } = useCourtPolicy(disputeData.courtId);
  const courtName = courtPolicy?.name;

  return (
    <Container>
      <Header>Preview</Header>
      <StyledCard>
        <Overlay />
        <PreviewContainer>
          <DisputeContext disputeDetails={disputeTemplate} />
          <Divider />

          <DisputeInfo
            isOverview={true}
            overrideIsList={true}
            courtId={disputeData.courtId}
            court={courtName}
            round={1}
            {...{ category: disputeData.category }}
          />
        </PreviewContainer>
        <Policies disputePolicyURI={disputeTemplate.policyURI} courtId={disputeData.courtId} />
      </StyledCard>
      <BatchCreationContainer>
        <WithHelpTooltip tooltipMsg="Create multiple cases with same data.">
          <Checkbox
            label="Create batch cases"
            small
            checked={isBatchCreation}
            onChange={() => setIsBatchCreation(!isBatchCreation)}
          />
        </WithHelpTooltip>

        {isBatchCreation ? (
          <FieldContainer>
            <FieldLabel>Number of cases to be created: {batchSize}</FieldLabel>
            <StyledPlusMinusField minValue={2} currentValue={batchSize} updateValue={(val) => setBatchSize(val)} />
          </FieldContainer>
        ) : null}
      </BatchCreationContainer>
      <NavigationButtons prevRoute="/resolver/policy" />
    </Container>
  );
};

export default Preview;
