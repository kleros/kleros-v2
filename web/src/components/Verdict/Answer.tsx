import React from "react";
import styled from "styled-components";

import { Answer } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

const AnswerTitle = styled.h3`
  margin: 0;
`;

const AnswerDescription = styled.h4`
  margin: 0;
  font-size: 15px;
  color: ${({ theme }) => theme.primaryText};
  padding-bottom: 0.5px;
`;

interface IAnswer {
  answer?: Answer;
  currentRuling: number;
}

const AnswerDisplay: React.FC<IAnswer> = ({ answer, currentRuling }) => {
  return (
    <>
      {answer ? (
        <Container>
          <AnswerTitle>
            {answer.title}
            {answer.description.trim() ? " -" : null}
          </AnswerTitle>
          <AnswerDescription>{answer.description.trim()}</AnswerDescription>
        </Container>
      ) : (
        <Container>{currentRuling !== 0 ? <h3>Answer 0x{currentRuling}</h3> : <h3>Refuse to Arbitrate</h3>}</Container>
      )}
    </>
  );
};

export default AnswerDisplay;
