import React, { Dispatch, SetStateAction, useMemo, useEffect } from "react";
import styled from "styled-components";

import { TextField } from "@kleros/ui-components-library";

import { isEmpty } from "src/utils";

const StyledLabel = styled.label`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StyledField = styled(TextField)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

interface IForm {
  contactLabel: string;
  contactPlaceholder: string;
  contactInput: string;
  contactIsValid: boolean;
  setContactInput: Dispatch<SetStateAction<string>>;
  setContactIsValid: Dispatch<SetStateAction<boolean>>;
  validator: RegExp;
  isEditing?: boolean;
}

const FormContact: React.FC<IForm> = ({
  contactLabel,
  contactPlaceholder,
  contactInput,
  contactIsValid,
  setContactInput,
  setContactIsValid,
  validator,
  isEditing,
}) => {
  useEffect(() => {
    setContactIsValid(validator.test(contactInput));
  }, [contactInput, setContactIsValid, validator]);

  const handleInputChange = (value: string) => {
    setContactInput(value);
  };

  const fieldVariant = useMemo(() => {
    if (!isEditing || isEmpty(contactInput)) {
      return undefined;
    }
    return contactIsValid ? "success" : "error";
  }, [contactInput, contactIsValid, isEditing]);

  return (
    <>
      <StyledLabel>{contactLabel}</StyledLabel>
      <StyledField
        inputProps={{ dir: "auto" }}
        variant={fieldVariant}
        value={contactInput}
        onChange={handleInputChange}
        placeholder={contactPlaceholder}
      />
    </>
  );
};

export default FormContact;
