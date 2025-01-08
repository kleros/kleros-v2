import React from "react";

import { Answer } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { AnswerTitle, AnswerTitleAndDescription } from "../DisputePreview/DisputeContext";

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
        </AnswerTitleAndDescription>
      ) : (
        <AnswerTitleAndDescription>
          {currentRuling !== 0 ? <small>Answer 0x{currentRuling}</small> : <small>Refuse to Arbitrate</small>}
        </AnswerTitleAndDescription>
      )}
    </>
  );
};

export default AnswerDisplay;
