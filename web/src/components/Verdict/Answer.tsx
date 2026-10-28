import React from "react";

import { Answer } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { AnswerDescription, AnswerTitle, AnswerTitleAndDescription } from "../DisputePreview/DisputeContext";

interface IAnswer {
  answer?: Answer;
  currentRuling: number;
  isTiedVote?: boolean;
}

const AnswerDisplay: React.FC<IAnswer> = ({ answer, currentRuling, isTiedVote }) => {
  return (
    <>
      {answer ? (
        <AnswerTitleAndDescription dir="auto">
          <AnswerTitle>{answer.title}</AnswerTitle>
          {isTiedVote && <AnswerDescription> (tied vote)</AnswerDescription>}
        </AnswerTitleAndDescription>
      ) : (
        <AnswerTitleAndDescription>
          {currentRuling !== 0 ? <small>Answer 0x{currentRuling}</small> : <small>Refuse to Arbitrate</small>}
          {isTiedVote && <AnswerDescription> (tied vote)</AnswerDescription>}
        </AnswerTitleAndDescription>
      )}
    </>
  );
};

export default AnswerDisplay;
