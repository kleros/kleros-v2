import styled from "styled-components";

import { NumberInputField } from "components/NumberInputField";

const NumberField = styled(NumberInputField)`
  input,
  input:focus {
    border: none;
    background-color: transparent;
    box-shadow: none;
    padding: 0px;
    color: ${({ theme }) => theme.primaryBlue};
    text-align: right;
    font-size: 24px;
  }
`;

export default NumberField;
