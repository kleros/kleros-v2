import React from "react";
import styled from "styled-components";

import { Answer } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

const AnswerTitle = styled.h3`
  margin: 0;
`;
interface IAnswer {
  answer?: Answer;
  currentRuling: number;
}
const AnswerDisplay: React.FC<IAnswer> = ({ answer, currentRuling }) => {
  return (
    <>
      {answer ? (
        <div>
          <AnswerTitle>{answer.title}</AnswerTitle>
          <small>{answer.description}</small>
        </div>
      ) : (
        <>{currentRuling !== 0 ? <h3>Answer 0x{currentRuling}</h3> : <h3>Refuse to Arbitrate</h3>}</>
      )}
    </>
  );
};
export default AnswerDisplay;
