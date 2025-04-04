import { Answer } from "@kleros/kleros-sdk";
import { isUndefined } from ".";
import { RefuseToArbitrateAnswer } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsSchema";

export const getVoteChoice = (vote: string, answers: Answer[]) => {
  // answer.id is hexadecimal number
  const selectedAnswer = answers?.find((answer) => BigInt(answer.id) === BigInt(vote));

  if (!isUndefined(selectedAnswer)) {
    return selectedAnswer.title;
  } else {
    return BigInt(vote) === BigInt(0) ? RefuseToArbitrateAnswer.title : `Answer 0x${vote}`;
  }
};
