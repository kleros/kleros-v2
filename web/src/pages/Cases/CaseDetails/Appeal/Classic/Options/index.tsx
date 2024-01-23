import React from "react";
import styled from "styled-components";
import { useCountdownContext } from "hooks/useClassicAppealContext";
import { StyledSkeleton } from "components/StyledSkeleton";
import StageOne from "./StageOne";
import StageTwo from "./StageTwo";
import { isUndefined } from "utils/index";

const Container = styled.div`
  margin: 24px 0;
`;

interface IOptions {
  setAmount: (val: string) => void;
}

const Options: React.FC<IOptions> = ({ setAmount }) => {
  const { loserSideCountdown } = useCountdownContext();
  return !isUndefined(loserSideCountdown) ? (
    <Container>
      {loserSideCountdown > 0 ? <StageOne setAmount={setAmount} /> : <StageTwo setAmount={setAmount} />}
    </Container>
  ) : (
    <StyledSkeleton />
  );
};

export default Options;
