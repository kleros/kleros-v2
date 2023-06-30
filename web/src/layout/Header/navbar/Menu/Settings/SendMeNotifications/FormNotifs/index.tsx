import React, { useState } from "react";
import styled from "styled-components";
import { Checkbox, Button } from "@kleros/ui-components-library";
import FormEmail from "./FormEmail";

const FormContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 calc(12px + (32 - 12) * ((100vw - 300px) / (1250 - 300)));
  padding-bottom: 32px;
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
  margin-top: 16px;
`;

const FormEmailContainer = styled.div`
  position: relative;
`;

const OPTIONS = [{ label: "When x." }, { label: "When y." }, { label: "When z." }, { label: "When w." }];

const FormNotifs: React.FC = () => {
  const [checkboxStates, setCheckboxStates] = useState<boolean[]>(new Array(OPTIONS.length).fill(false));
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);

  const handleCheckboxChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckboxStates = [...checkboxStates];
    newCheckboxStates[index] = e.target.checked;
    setCheckboxStates(newCheckboxStates);
  };

  return (
    <FormContainer>
      {OPTIONS.map(({ label }, index) => (
        <StyledCheckbox
          key={label}
          onChange={handleCheckboxChange(index)}
          checked={checkboxStates[index]}
          small={true}
          label={label}
        />
      ))}
      <FormEmailContainer>
        <FormEmail
          emailInput={emailInput}
          emailIsValid={emailIsValid}
          setEmailInput={setEmailInput}
          setEmailIsValid={setEmailIsValid}
        />
      </FormEmailContainer>

      <ButtonContainer>
        <Button text="Save" disabled={!emailIsValid} />
      </ButtonContainer>
    </FormContainer>
  );
};

export default FormNotifs;
