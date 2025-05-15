import React from "react";
import styled from "styled-components";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { isUndefined } from "src/utils";

import { responsiveSize } from "styles/responsiveSize";

import NextButton from "./NextButton";
import PreviousButton from "./PreviousButton";
import SubmitBatchDisputesButton from "./SubmitBatchDisputesButton";
import SubmitDisputeButton from "./SubmitDisputeButton";

const Container = styled.div`
  display: flex;
  gap: 24px;
  margin-top: ${responsiveSize(32, 24)};
  flex-wrap: wrap;
  justify-content: center;
`;

interface NavigationButtonsProps {
  prevRoute: string;
  nextRoute?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ prevRoute, nextRoute }) => {
  const { isBatchCreation } = useNewDisputeContext();

  const SubmitButton = isBatchCreation ? SubmitBatchDisputesButton : SubmitDisputeButton;
  return (
    <Container>
      <PreviousButton prevRoute={prevRoute} />
      {isUndefined(nextRoute) ? <SubmitButton /> : <NextButton nextRoute={nextRoute} />}
    </Container>
  );
};

export default NavigationButtons;
