import React from "react";
import styled from "styled-components";
import { Field } from "@kleros/ui-components-library";
import Title from "../../title";

const Wrapper = styled.div`
  height: auto;
  width: auto;
  display: flex;
  align-items: center;
`;

const StyledTitle = styled(Title)`
  width: 200px;
`;

const StyledField = styled(Field)`
  input {
    padding: 0 16px;
  }
`;

const Question = () => {
  return (
    <Wrapper>
      <StyledTitle>Question:</StyledTitle>
      <StyledField placeholder="i.e. Who is right?" />
    </Wrapper>
  );
};

export default Question;
