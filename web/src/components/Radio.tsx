import React from "react";
import styled from "styled-components";

/**
 * Single radio input.
 *
 * v3 of `@kleros/ui-components-library` replaced its single `Radio` export with
 * a `RadioGroup` component (still exported as `Radio`). The dispute-feature
 * selection UI renders radios individually with a shared `checked` state, which
 * does not fit the group API, so this local component preserves the original
 * single-radio contract.
 */

const Container = styled.label<{ $small?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  cursor: pointer;
  font-size: ${({ $small }) => ($small ? "14px" : "16px")};
  color: ${({ theme }) => theme.primaryText};

  input[type="radio"] {
    accent-color: ${({ theme }) => theme.primaryBlue};
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
  }

  &:has(input:disabled) {
    cursor: not-allowed;
  }
`;

interface RadioBaseProps {
  small?: boolean;
  checked?: boolean;
}

export interface RadioProps extends RadioBaseProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

const Radio: React.FC<RadioProps> = ({ label, small, className, ...props }) => (
  <Container className={className} $small={small}>
    <input type="radio" {...props} />
    {label}
  </Container>
);

export default Radio;
