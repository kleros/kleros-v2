import styled from "styled-components";

import { BigNumberField } from "@kleros/ui-components-library";

const EthAmountField = styled(BigNumberField)`
  width: 100%;

  input {
    text-align: center;
  }

  /* Hover-revealed stepper arrows don't suit an ETH amount picker. */
  & .input-wrapper > div:has(> button[aria-label="Increment"]) {
    display: none;
  }

  & .input-wrapper::after {
    content: "ETH";
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.primaryText};
    pointer-events: none;
  }
`;

export default EthAmountField;
