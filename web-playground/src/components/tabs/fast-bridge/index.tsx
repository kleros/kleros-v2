import React from "react";
import styled from "styled-components";
import RulingsOnL2 from "./l2-rulings";
import RulingsOnL1 from "./l1-rulings";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

const StyledRulingsOnL2 = styled(RulingsOnL2)`
  height: 45%;
  width: 100%;
`;

const StyledRulingsOnL1 = styled(RulingsOnL1)`
  height: 45%;
  width: 100%;
`;

const FastBridge = () => {
  return (
    <Wrapper>
      <StyledRulingsOnL2 />
      <StyledRulingsOnL1 />
    </Wrapper>
  );
};

export default FastBridge;
