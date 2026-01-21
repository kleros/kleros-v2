import React from "react";

import { useTranslation } from "react-i18next";

import { Answer } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { AnswerTitle, AnswerTitleAndDescription } from "../DisputePreview/DisputeContext";

interface IAnswer {
  answer?: Answer;
  currentRuling: number;
}

const AnswerDisplay: React.FC<IAnswer> = ({ answer, currentRuling }) => {
  const { t } = useTranslation();

  return (
    <>
      {answer ? (
        <AnswerTitleAndDescription dir="auto">
          <AnswerTitle>{answer.title}</AnswerTitle>
        </AnswerTitleAndDescription>
      ) : (
        <AnswerTitleAndDescription>
          {currentRuling !== 0 ? (
            <small>{t("voting.answer_0x", { ruling: currentRuling })}</small>
          ) : (
            <small>{t("voting.refuse_to_arbitrate")}</small>
          )}
        </AnswerTitleAndDescription>
      )}
    </>
  );
};

export default AnswerDisplay;
