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

interface IAnswer {
  answer?: Answer;
  currentRuling: number;
}

const AnswerDisplay: React.FC<IAnswer> = ({ answer, currentRuling }) => {
  return (
    <>
      {answer ? (
        <Container>
          <small>
            {answer.title}
            {answer.description.trim() ? " -" : null}
          </small>
          <small>{answer.description.trim()}</small>
        </Container>
      ) : (
        <Container>
          {currentRuling !== 0 ? <small>Answer 0x{currentRuling}</small> : <small>Refuse to Arbitrate</small>}
        </Container>
      )}
    </>
  );
};

export default AnswerDisplay;
