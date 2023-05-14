import React, { Dispatch, SetStateAction, useEffect } from "react";
import styled from "styled-components";

const StyledInput = styled.input`
  display: flex;
  width: 100%;
  height: 45px;
  margin-top: 34px;
  background-color: transparent;
  color: ${({ theme }) => theme.primaryText};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  outline: none;
  box-shadow: none;
  font-size: 16px;
  padding-left: 16px;

  :focus {
    border-color: ${({ theme }) => theme.stroke};
    box-shadow: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.secondaryText};
  }
`;

interface IFormEmail {
  emailInput: string;
  setEmailInput: Dispatch<SetStateAction<string>>;
  setEmailIsValid: Dispatch<SetStateAction<boolean>>;
}

const FormEmail: React.FC<IFormEmail> = ({ emailInput, setEmailInput, setEmailIsValid }) => {
  useEffect(() => {
    setEmailIsValid(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailInput));
  }, [emailInput]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setEmailInput(event.target.value);
  };

  return <StyledInput type="text" value={emailInput} onChange={handleInputChange} placeholder="youremail@email.com" />;
};

export default FormEmail;
