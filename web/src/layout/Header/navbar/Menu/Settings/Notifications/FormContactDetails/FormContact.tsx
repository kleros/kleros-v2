import React, { Dispatch, SetStateAction, useEffect, useId, useMemo } from "react";

import { TextField } from "@kleros/ui-components-library";

import { isEmpty } from "src/utils";

interface IForm {
  contactLabel: string;
  contactPlaceholder: string;
  contactInput: string;
  contactIsValid: boolean;
  setContactInput: Dispatch<SetStateAction<string>>;
  setContactIsValid: Dispatch<SetStateAction<boolean>>;
  validator: RegExp;
  isEditing?: boolean;
  isDisabled?: boolean;
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
  isDisabled,
}) => {
  const labelId = useId();
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
      <label id={labelId} className="flex justify-between mb-2.5">
        {contactLabel}
      </label>
      <TextField
        aria-labelledby={labelId}
        inputProps={{ dir: "auto" }}
        variant={fieldVariant}
        value={contactInput}
        onChange={handleInputChange}
        placeholder={contactPlaceholder}
        isDisabled={isDisabled}
        className="flex flex-col items-center w-full"
      />
    </>
  );
};

export default FormContact;
