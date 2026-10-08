import React from "react";

import { useTranslation } from "react-i18next";

import { Answer, useNewDisputeContext } from "context/NewDisputeContext";

import LabeledInput from "components/LabeledInput";
import PlusMinusField from "components/PlusMinusField";

const OptionsFields: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const { t } = useTranslation();

  const updateOptions = (value: number) => {
    const defaultAnswer: Answer = { title: "", id: value.toString(), description: "" };
    const answers = disputeData.answers;

    if (value < answers?.length) return setDisputeData({ ...disputeData, answers: answers.slice(0, value) });
    if (value > answers?.length) return setDisputeData({ ...disputeData, answers: [...answers, defaultAnswer] });
  };

  const handleOptionWrite = (field: "title" | "description", key: number, value: string) => {
    const answers = disputeData.answers.map((answer, index) =>
      index === key ? { ...answer, [field]: value } : answer
    );
    setDisputeData({ ...disputeData, answers });
  };
  return (
    <>
      <div className="flex flex-col gap-12 w-[84vw] lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))]">
        {disputeData.answers.map((answer, index) => (
          <div key={answer.id} className="flex flex-col gap-6 w-full lg:grid lg:[grid-template-columns:160px_auto]">
            <LabeledInput
              label={t("forms.labels.voting_option_number", { number: index + 1 })}
              placeholder={t("forms.placeholders.pay_dai_example")}
              value={answer.title ?? ""}
              onChange={(value) => handleOptionWrite("title", index, value)}
            />
            <LabeledInput
              label={t("forms.labels.option_description")}
              placeholder={t("forms.placeholders.description_for_option_number", { number: index + 1 })}
              value={answer.description ?? ""}
              onChange={(value) => handleOptionWrite("description", index, value)}
            />
          </div>
        ))}
      </div>
      <PlusMinusField
        currentValue={disputeData.answers?.length ?? 2}
        updateValue={updateOptions}
        minValue={2}
        className="[align-self:start] m-[32px_0px_48px]"
      />
    </>
  );
};

export default OptionsFields;
