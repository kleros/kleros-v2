import React, { useState } from "react";
import styled from "styled-components";

import { Field } from "@kleros/ui-components-library";

const Container = styled.div`
  width: 100%;
  height: fit-content;
`;

const StyledField = styled(Field)`
  width: 100%;
  height: fit-content;

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
  input {
    border: 1px solid ${({ theme }) => theme.stroke};
    border-right: none;
    height: 45px;
    font-size: 16px;
  }
`;

interface INumberInputField extends Omit<React.ComponentProps<typeof Field>, "onChange"> {
  placeholder?: string;
  message?: string;
  value?: string;
  onChange?: (value: string) => void;
  formatter?: (value: string) => string;
  className?: string;
}

export const NumberInputField: React.FC<INumberInputField> = ({
  placeholder,
  message,
  value,
  onChange,
  formatter,
  className,
  variant = "info",
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Container {...{ className }}>
      {isEditing ? (
        <StyledField
          type="text"
          onInput={(e) => {
            const value = e.currentTarget.value.replace(/[^0-9.]/g, "");

            e.currentTarget.value = formatter ? formatter(value) : value;
            return e;
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(event.target.value);
          }}
          onBlur={toggleEditing}
          value={formatter ? formatter(value ?? "0") : value}
          {...{ placeholder, message, variant }}
        />
      ) : (
        <StyledField
          type="text"
          value={formatter ? formatter(value ?? "0") : value}
          onFocus={toggleEditing}
          {...{ placeholder, message, variant }}
          readOnly
        />
      )}
    </Container>
  );
};
