import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import PlusMinusField from "components/PlusMinusField";
import LabeledInput from "components/LabeledInput";
import { Answer, useNewDisputeContext } from "context/NewDisputeContext";

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

  const updateOptions = (value: number) => {
    let defaultAnswer: Answer = { title: "", id: value.toString() };
    let answers = disputeData.answers;

    if (value < answers?.length) return setDisputeData({ ...disputeData, answers: answers.splice(0, value) });
    if (value > answers?.length) return setDisputeData({ ...disputeData, answers: [...answers, defaultAnswer] });
  };

  const handleOptionWrite = (event: React.ChangeEvent<HTMLInputElement>, key: number) => {
    let answers = disputeData.answers;
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
              label={`Voting Option ${index + 1}`}
              placeholder="eg. Pay 150 DAI"
              value={answer.title ?? ""}
              onChange={(event) => handleOptionWrite(event, index)}
            />
            <LabeledInput
              name="description"
              label="Option Description (Optional)"
              placeholder={`Description for Option ${index + 1}`}
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
