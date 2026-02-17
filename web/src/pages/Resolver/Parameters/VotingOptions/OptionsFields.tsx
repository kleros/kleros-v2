import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { Answer, useNewDisputeContext } from "context/NewDisputeContext";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import LabeledInput from "components/LabeledInput";
import PlusMinusField from "components/PlusMinusField";

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  width: 84vw;

  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  ${landscapeStyle(
    () => css`
      display: grid;
      grid-template-columns: 160px auto;
    `
  )}
`;
const StyledPlusMinusField = styled(PlusMinusField)`
  align-self: start;
  margin: 32px 0px 48px;
`;

const OptionsFields: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const { t } = useTranslation();

  const updateOptions = (value: number) => {
    const defaultAnswer: Answer = { title: "", id: value.toString(), description: "" };
    const answers = disputeData.answers;

    if (value < answers?.length) return setDisputeData({ ...disputeData, answers: answers.splice(0, value) });
    if (value > answers?.length) return setDisputeData({ ...disputeData, answers: [...answers, defaultAnswer] });
  };

  const handleOptionWrite = (event: React.ChangeEvent<HTMLInputElement>, key: number) => {
    const answers = disputeData.answers;
    answers[key] = { ...answers[key], [event.target.name]: event.target.value };
    setDisputeData({ ...disputeData, answers });
  };
  return (
    <>
      <OptionsContainer>
        {disputeData.answers.map((answer, index) => (
          <InputContainer key={answer.id}>
            <LabeledInput
              name="title"
              label={t("forms.labels.voting_option_number", { number: index + 1 })}
              placeholder={t("forms.placeholders.pay_dai_example")}
              value={answer.title ?? ""}
              onChange={(event) => handleOptionWrite(event, index)}
            />
            <LabeledInput
              name="description"
              label={t("forms.labels.option_description")}
              placeholder={t("forms.placeholders.description_for_option_number", { number: index + 1 })}
              value={answer.description ?? ""}
              onChange={(event) => handleOptionWrite(event, index)}
            />
          </InputContainer>
        ))}
      </OptionsContainer>
      <StyledPlusMinusField currentValue={disputeData.answers?.length ?? 2} updateValue={updateOptions} minValue={2} />
    </>
  );
};

export default OptionsFields;
