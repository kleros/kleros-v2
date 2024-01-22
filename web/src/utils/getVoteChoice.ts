import { isUndefined } from ".";

export const getVoteChoice = (vote: number, answers: { title: string }[]) => {
  const selectedAnswer = answers?.[vote - 1]?.title;
  if (vote === 0) {
    return "Refuse to arbitrate";
  } else if (!isUndefined(selectedAnswer)) {
    return selectedAnswer;
  } else {
    return `Answer 0x${vote}`;
  }
};
