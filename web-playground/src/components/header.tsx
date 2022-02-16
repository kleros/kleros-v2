import React from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import ConnectAccount from "./connect-account";

const StyledDiv = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 64px;
  width: 100%;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledRightSide = styled.div`
  height: 64px;
  width: 400px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledButton = styled(Button)`
  margin-left: 8px;
`;

interface IHeader {
  toggleTheme: () => void;
}

const Header: React.FC<IHeader> = ({ toggleTheme }) => {
  return (
    <StyledDiv>
      <StyledButton small text="Change theme" onClick={toggleTheme} />
      <StyledRightSide>
        <ConnectAccount />
      </StyledRightSide>
    </StyledDiv>
  );
};

export default Header;
