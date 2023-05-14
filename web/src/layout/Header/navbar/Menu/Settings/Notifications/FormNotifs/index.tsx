import { Checkbox } from "@kleros/ui-components-library";
import React, { useState } from "react";
import styled from "styled-components";
import FormEmail from "./FormEmail";
import { Button } from "@kleros/ui-components-library";

const FormContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: 32px;
  padding-right: 32px;
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

const EmailErrorContainer = styled.div`
  position: absolute;
  color: ${({ theme }) => theme.error};
  font-size: 12px;
  padding-top: 4px;
  padding-left: 16px;
`;

const FormNotifs: React.FC = () => {
  const [isWhenX, setIsWhenX] = useState<boolean>(false);
  const [isWhenY, setIsWhenY] = useState<boolean>(false);
  const [isWhenZ, setIsWhenZ] = useState<boolean>(false);
  const [isWhenW, setIsWhenW] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);

  return (
    <FormContainer>
      <StyledCheckbox onChange={(e) => setIsWhenX(e.target.checked)} checked={isWhenX} small={true} label="When x." />
      <StyledCheckbox onChange={(e) => setIsWhenY(e.target.checked)} checked={isWhenY} small={true} label="When y." />
      <StyledCheckbox onChange={(e) => setIsWhenZ(e.target.checked)} checked={isWhenZ} small={true} label="When z." />
      <StyledCheckbox onChange={(e) => setIsWhenW(e.target.checked)} checked={isWhenW} small={true} label="When w." />
      <FormEmailContainer>
        <FormEmail emailInput={emailInput} setEmailInput={setEmailInput} setEmailIsValid={setEmailIsValid} />
        {emailInput !== "" && !emailIsValid && <EmailErrorContainer>Email is invalid</EmailErrorContainer>}
      </FormEmailContainer>

      <ButtonContainer>
        <Button text="Save" disabled={!emailIsValid} />
      </ButtonContainer>
    </FormContainer>
  );
};

export default FormNotifs;
