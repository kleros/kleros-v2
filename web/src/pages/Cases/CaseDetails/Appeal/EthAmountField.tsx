import styled from "styled-components";

import { BigNumberField } from "@kleros/ui-components-library";

import { hideBigNumberFieldSteppers } from "styles/commonStyles";

const EthAmountField = styled(BigNumberField)`
  width: 100%;

  input {
    text-align: center;
  }

  ${hideBigNumberFieldSteppers}

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
