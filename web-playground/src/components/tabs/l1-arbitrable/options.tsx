import React from "react";
import styled from "styled-components";
import { Button, Field } from "@kleros/ui-components-library";
import Title from "../../title";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledTitle = styled(Title)`
  width: 200px;
`;

const StyledField = styled(Field)`
  width: 90px;
  input {
    padding: 0 16px;
  }
`;

interface IOptions {
  options: string[];
  setOptions: (options: string[]) => void;
}

const Options: React.FC<IOptions> = ({ options, setOptions }) => {
  return (
    <Wrapper>
      <StyledTitle>Answers:</StyledTitle>
      <OptionsContainer>
        {options.map((option, i) => (
          <StyledField
            value={option}
            key={i}
            placeholder="..."
            onChange={(event) => {
              const newOptions = [...options];
              newOptions[i] = event.target.value;
              setOptions(newOptions);
            }}
          />
        ))}
        <ButtonsContainer>
          <Button
            small
            variant="primary"
            text="-"
            onClick={() => setOptions(options.slice(0, -1))}
            disabled={options.length <= 2}
          />
          <Button
            small
            variant="primary"
            text="+"
            onClick={() => setOptions([...options, ""])}
            disabled={options.length > 4}
          />
        </ButtonsContainer>
      </OptionsContainer>
    </Wrapper>
  );
};

export default Options;
