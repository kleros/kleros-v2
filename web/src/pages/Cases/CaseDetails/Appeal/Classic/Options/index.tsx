import React from "react";
import styled from "styled-components";
import { useLoserSideCountdownContext } from "hooks/useClassicAppealContext";
import StageOne from "./StageOne";
import StageTwo from "./StageTwo";
import { notUndefined } from "utils/index";

const Options: React.FC = () => {
  const loserSideCountdown = useLoserSideCountdownContext();
  return notUndefined(loserSideCountdown) ? (
    <Container>
      {loserSideCountdown! > 0 ? <StageOne /> : <StageTwo />}
    </Container>
  ) : (
    <h1>Loading...</h1>
  );
};

const Container = styled.div`
  margin: 24px 0;
`;

export default Options;
