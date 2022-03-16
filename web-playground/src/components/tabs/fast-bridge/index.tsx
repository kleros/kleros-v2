import React from "react";
import styled from "styled-components";
import RulingsOnL2 from "./l2-rulings";
import RulingsOnL1 from "./l1-rulings";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: block;
  overflow: auto;
`;

const StyledRulingsOnL2 = styled(RulingsOnL2)`
  min-height: 250px;
  height: 45%;
  width: 100%;
`;

const StyledRulingsOnL1 = styled(RulingsOnL1)`
  min-height: 250px;
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
