import React from "react";
import styled from "styled-components";
import Icon from "tsx:svgs/icons/close.svg";

const StyledIcon = styled(Icon)`
  position: absolute;
  width: 18px;
  height: 18px;
  align-self: flex-end;
  cursor: pointer;

  path {
    fill: ${({ theme }) => theme.stroke};
  }
`;

interface IClose {
  togglePopup: () => void;
}

const Close: React.FC<IClose> = ({ togglePopup }) => {
  return <StyledIcon onClick={togglePopup}>CloseIcon</StyledIcon>;
};
export default Close;
