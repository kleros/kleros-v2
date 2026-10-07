import styled from "styled-components";

import { BigNumberField } from "@kleros/ui-components-library";

const EthAmountField = styled(BigNumberField)`
  width: 100%;

  /* Symmetric padding keeps the centered value clear of the suffix and the library's
     hover-revealed steppers, which sit in the rightmost 26px. */
  input {
    text-align: center;
    padding-inline: 64px;
  }

  & .input-wrapper::after {
    content: "ETH";
    position: absolute;
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.primaryText};
    pointer-events: none;
  }
`;

export default EthAmountField;
