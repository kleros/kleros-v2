import React, { Dispatch, SetStateAction, useMemo, useEffect } from "react";
import styled from "styled-components";

import { Field } from "@kleros/ui-components-library";
import { isEmpty } from "src/utils";

const StyledLabel = styled.label`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StyledField = styled(Field)`
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setContactInput(event.target.value);
  };

  const fieldVariant = useMemo(() => {
    if (isEmpty(contactInput) || !isEditing) {
      return undefined;
    }
    return contactIsValid ? "success" : "error";
  }, [contactInput, contactIsValid, isEditing]);

  return (
    <>
      <StyledLabel>{contactLabel}</StyledLabel>
      <StyledField
        variant={fieldVariant}
        value={contactInput}
        onChange={handleInputChange}
        placeholder={contactPlaceholder}
      />
    </>
  );
};

export default FormContact;
