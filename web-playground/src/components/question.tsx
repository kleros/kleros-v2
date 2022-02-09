import React from "react";
import styled from "styled-components";
import Title from "./title";

const Wrapper = styled.div`
  height: auto;
  width: auto;
  display: flex;
  align-items: center;
`;

const StyledQuestion = styled.p`
  font-size: 24px;
`;

const StyledTitle = styled(Title)`
  width: 200px;
`;

interface IQuestion {
  question: string;
}

const Question: React.FC<IQuestion> = ({ question }) => (
  <Wrapper>
    <StyledTitle>Question:</StyledTitle>
    <StyledQuestion>{question}</StyledQuestion>
  </Wrapper>
);

export default Question;
