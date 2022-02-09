import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import Question from "./question";
import Options from "./options";
import Jurors from "./jurors";
import Subcourt from "./subcourt";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  justify-content: center;
`;

const StyledContent = styled.div`
  width: 50%;
  height: 100%;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
`;

const StyledButton = styled(Button)`
  align-self: center;
`;

const L1Arbitrable = () => {
  const [options, setOptions] = useState<string[]>(["", ""]);
  return (
    <Wrapper>
      <StyledContent>
        <Question />
        <Options {...{ options, setOptions }} />
        <Jurors defaultValue={2} callback={() => {}} />
        <Subcourt defaultValue={0} callback={() => {}} />
        <StyledButton text="Create Dispute" />
      </StyledContent>
    </Wrapper>
  );
};

export default L1Arbitrable;
