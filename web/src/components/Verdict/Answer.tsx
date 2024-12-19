import React from "react";
import styled from "styled-components";

import { Answer } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { AnswerDescription, AnswerTitle, AnswerTitleAndDescription } from "../DisputePreview/DisputeContext";

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
        <AnswerTitleAndDescription dir="auto">
          <AnswerTitle>{answer.title}</AnswerTitle>
          <AnswerDescription>{answer.description.trim() ? ` - ${answer.description}` : null}</AnswerDescription>
        </AnswerTitleAndDescription>
      ) : (
        <Container>
          {currentRuling !== 0 ? <small>Answer 0x{currentRuling}</small> : <small>Refuse to Arbitrate</small>}
        </Container>
      )}
    </>
  );
};

export default AnswerDisplay;
