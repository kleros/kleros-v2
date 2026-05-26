import styled from "styled-components";

import { TextField } from "@kleros/ui-components-library";

/** Centered amount input with a static "ETH" suffix, shared by the Classic and Shutter appeal funding fields.
 *  position: relative anchors the :before to the field (the ui-components-library TextField root is not positioned);
 *  the appearance rules hide the native type="number" spinners (the library does not style them). */
const EthAmountField = styled(TextField)`
  width: 100%;
  position: relative;
  & input {
    text-align: center;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
  &:before {
    position: absolute;
    content: "ETH";
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.primaryText};
  }
`;

export default EthAmountField;
