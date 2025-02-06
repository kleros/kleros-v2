import { Answer } from "@kleros/kleros-sdk";
import { isUndefined } from ".";

export const getVoteChoice = (vote: string, answers: Answer[]) => {
  // answer.id is hexadecimal number
  const selectedAnswer = answers?.find((answer) => BigInt(answer.id) === BigInt(vote));

  if (!isUndefined(selectedAnswer)) {
    return selectedAnswer.title;
  } else {
    return `Answer 0x${vote}`;
  }
};
