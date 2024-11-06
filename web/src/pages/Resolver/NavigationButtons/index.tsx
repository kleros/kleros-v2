import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import NextButton from "./NextButton";
import PreviousButton from "./PreviousButton";
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
  return (
    <Container>
      <PreviousButton prevRoute={prevRoute} />
      {prevRoute === "/resolver/policy" ? <SubmitDisputeButton /> : <NextButton nextRoute={nextRoute} />}
    </Container>
  );
};

export default NavigationButtons;
