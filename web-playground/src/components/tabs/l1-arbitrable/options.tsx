import React from "react";
import styled from "styled-components";
import Title from "../../title";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const StyledTitle = styled(Title)`
  width: 200px;
`;

const StyledOption = styled.h1`
  font-weight: 400;
  white-space: pre;
`;

interface IOptions {
  options: string[];
}

const Options: React.FC<IOptions> = ({ options }) => {
  return (
    <Wrapper>
      <StyledTitle>Answers:</StyledTitle>
      <OptionsContainer>
        {options.slice(0, -1).map((option, i) => (
          <React.Fragment key={i}>
            <StyledOption key={i}>{option}</StyledOption>
            <StyledOption key={i + options.length}>|</StyledOption>
          </React.Fragment>
        ))}
        <StyledOption>{options.at(-1)}</StyledOption>
      </OptionsContainer>
    </Wrapper>
  );
};

export default Options;
