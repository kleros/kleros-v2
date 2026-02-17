import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { Card } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { useCourtPolicy } from "queries/useCourtPolicy";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { DisputeContext } from "components/DisputePreview/DisputeContext";
import { Policies } from "components/DisputePreview/Policies";
import DisputeInfo from "components/DisputeView/DisputeInfo";
import { Divider } from "components/Divider";

import NavigationButtons from "../NavigationButtons";

import BatchCreationCard from "./BatchCreationCard";

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

const Overlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;

const Preview: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, disputeTemplate } = useNewDisputeContext();
  const { data: courtPolicy } = useCourtPolicy(disputeData.courtId);
  const courtName = courtPolicy?.name;

  return (
    <Container>
      <Header>{t("timeline.preview")}</Header>
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
      <BatchCreationCard />
      <NavigationButtons prevRoute="/resolver/policy" />
    </Container>
  );
};

export default Preview;
