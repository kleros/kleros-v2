import { DropdownSelect } from "@kleros/ui-components-library";
import styled from "styled-components";

const StyledDropdown = styled(DropdownSelect)`
  button {
    border: none;
    background-color: transparent;
    padding: 0;
    gap: 8px;
    width: auto;
    > div {
      padding: 0px;
      background-color: transparent;
      border: none;
    }
    > svg {
      width: 8px;
      height: 8px;
      fill: ${({ theme }) => theme.primaryText};
    }
  }
  > div {
    margin-top: 4px;
  }
  .item-icon {
    max-height: 24px;
    max-width: 24px;
    margin-right: 8px;
  }
`;
export default StyledDropdown;
