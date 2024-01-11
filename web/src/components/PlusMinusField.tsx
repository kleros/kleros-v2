import React from "react";
import styled, { css } from "styled-components";
import Ellipse from "assets/svgs/icons/ellipse.svg";
import Plus from "assets/svgs/icons/plus.svg";
import Minus from "assets/svgs/icons/minus.svg";

const Container = styled.div`
  display: flex;
  gap: 8px;
  margin: 32px 0px 48px;
`;

const IconContainer = styled.button`
  position: relative;
  padding: 0;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;

const StyledEllipseIcon = styled(Ellipse)<{ isDisabled?: boolean }>`
  circle {
    ${({ isDisabled }) =>
      isDisabled &&
      css`
        fill-opacity: 0.12;
      `};
  }
`;

const Icon = styled.svg`
  fill: ${({ theme }) => theme.white};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

interface IPlusMinusField {
  currentValue: number;
  updateValue: (currentValue: number) => void;
  minValue?: number;
  className?: string;
}
const PlusMinusField: React.FC<IPlusMinusField> = ({ currentValue, updateValue, minValue = 0, className }) => {
  const incrementValue = () => updateValue(++currentValue);
  const decrementValue = () => currentValue > minValue && updateValue(--currentValue);
  return (
    <Container className={className}>
      <IconContainer onClick={incrementValue}>
        <StyledEllipseIcon />
        <Icon as={Plus} />
      </IconContainer>
      <IconContainer onClick={decrementValue}>
        <StyledEllipseIcon isDisabled={currentValue === minValue} />
        <Icon as={Minus} />
      </IconContainer>
    </Container>
  );
};

export default PlusMinusField;
