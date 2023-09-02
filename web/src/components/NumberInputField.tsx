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
`;

interface INumberInputField {
  placeholder?: string;
  message?: string;
  value?: string;
  onChange?: (value: string) => void;
  formatter?: (value: string) => string;
}

export const NumberInputField: React.FC<INumberInputField> = ({ placeholder, message, value, onChange, formatter }) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Container>
      {isEditing ? (
        <StyledField
          type="number"
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(event.target.value);
          }}
          placeholder={placeholder}
          message={message}
          variant="info"
          onBlur={toggleEditing}
        />
      ) : (
        <StyledField
          type="text"
          value={formatter ? formatter(value ?? "0") : value}
          placeholder={placeholder}
          message={message}
          variant="info"
          onFocus={toggleEditing}
          readOnly
        />
      )}
    </Container>
  );
};
