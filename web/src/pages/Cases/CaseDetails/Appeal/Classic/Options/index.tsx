import React from "react";
import styled from "styled-components";
import { useLoserSideCountdownContext } from "hooks/useClassicAppealContext";
import { StyledSkeleton } from "components/StyledSkeleton";
import StageOne from "./StageOne";
import StageTwo from "./StageTwo";
import { isUndefined } from "utils/index";

const Container = styled.div`
  margin: 24px 0;
`;

const Options: React.FC = () => {
  const loserSideCountdown = useLoserSideCountdownContext();
  return !isUndefined(loserSideCountdown) ? (
    <Container>{loserSideCountdown > 0 ? <StageOne /> : <StageTwo />}</Container>
  ) : (
    <StyledSkeleton />
  );
};

export default Options;
