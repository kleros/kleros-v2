import React, { useState } from "react";
import styled from "styled-components";
import { Radio } from "@kleros/ui-components-library";
import Title from "./title";

const Wrapper = styled.div`
  height: auto;
  width: auto;
  display: flex;
  align-items: center;
`;

const RadioContainer = styled.div`
  display: flex;
  gap: 32px;
`;

const StyledTitle = styled(Title)`
  width: 200px;
`;

interface Option {
  label: string;
  value: string | number;
}

interface IAnswers {
  options: Option[];
  callback: (value: Option["value"]) => void;
  defaultValue?: Option["value"];
  title?: string;
}

const Answers: React.FC<IAnswers> = ({
  options,
  callback,
  defaultValue,
  title,
}) => {
  const [currentValue, setCurrentValue] = useState(defaultValue);
  return (
    <Wrapper>
      <StyledTitle>{title ?? "Answers:"}</StyledTitle>
      <RadioContainer>
        {options.map(({ label, value }, i) => {
          return (
            <Radio
              label={label}
              value={value}
              checked={value === currentValue}
              onChange={() => {
                setCurrentValue(value);
                callback(value);
              }}
              key={i}
            />
          );
        })}
      </RadioContainer>
    </Wrapper>
  );
};

export default Answers;
