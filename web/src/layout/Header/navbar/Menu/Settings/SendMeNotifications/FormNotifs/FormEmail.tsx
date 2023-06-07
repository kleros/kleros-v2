import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Field } from "@kleros/ui-components-library";

const StyledField = styled(Field)`
  display: flex;
  width: 100%;
  margin-top: 34px;
`;

interface IFormEmail {
  emailInput: string;
  emailIsValid: boolean;
  setEmailInput: Dispatch<SetStateAction<string>>;
  setEmailIsValid: Dispatch<SetStateAction<boolean>>;
}

const FormEmail: React.FC<IFormEmail> = ({ emailInput, setEmailInput, setEmailIsValid, emailIsValid }) => {
  useEffect(() => {
    setEmailIsValid(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailInput));
  }, [emailInput]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setEmailInput(event.target.value);
  };

  const fieldVariant = useMemo(() => {
    if (emailInput === "") {
      return undefined;
    }
    return emailIsValid ? "success" : "error";
  }, [emailInput, emailIsValid]);

  return (
    <StyledField
      variant={fieldVariant}
      value={emailInput}
      onChange={handleInputChange}
      placeholder="youremail@email.com"
    />
  );
};

export default FormEmail;
