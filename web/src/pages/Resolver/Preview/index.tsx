import React from "react";
import styled, { css } from "styled-components";
import { useCourtPolicy } from "queries/useCourtPolicy";
import DisputeInfo from "components/DisputeCard/DisputeInfo";
import { responsiveSize } from "styles/responsiveSize";
import { DisputeContext } from "components/DisputePreview/DisputeContext";
import { Policies } from "components/DisputePreview/Policies";
import { Card } from "@kleros/ui-components-library";
import { landscapeStyle } from "styles/landscapeStyle";
import NavigationButtons from "../NavigationButtons";
import { useNewDisputeContext } from "context/NewDisputeContext";

const Container = styled.div`
  width: 100%;
  padding: 0px ${responsiveSize(10, 130)};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
  min-height: 100px;
  margin-bottom: ${responsiveSize(130, 70)};
`;
const PreviewContainer = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: ${responsiveSize(16, 32)};
  padding: ${responsiveSize(16, 32)};
`;

const Divider = styled.hr`
  width: 100%;
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: 0;
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

const Preview: React.FC = () => {
  const { disputeData, disputeTemplate } = useNewDisputeContext();
  const { data: courtPolicy } = useCourtPolicy(disputeData.courtId);
  const courtName = courtPolicy?.name;

  return (
    <Container>
      <Header>Preview</Header>
      <StyledCard>
        <PreviewContainer>
          <DisputeContext disputeTemplate={disputeTemplate} />
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
      <NavigationButtons prevRoute="/resolver/policy" />
    </Container>
  );
};

export default Preview;
