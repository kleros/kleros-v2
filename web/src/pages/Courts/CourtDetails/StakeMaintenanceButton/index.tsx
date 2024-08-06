import React, { useState } from "react";
import styled from "styled-components";

import DottedMenuButton from "components/DottedMenuButton";
import { EnsureChain } from "components/EnsureChain";
import { Overlay } from "components/Overlay";
import { Phase } from "layout/Header/navbar/Debug";

import ExecuteDelayedStakeButton from "./ExecuteDelayedStakeButton";
import PassPhaseButton from "./PassPhaseButton";

const Container = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const PopupContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  height: fit-content;
  overflow-y: auto;
  z-index: 31;
  padding: 27px;
  gap: 16px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  border-radius: 3px;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);

  bottom: 0;
  left: 0;
  transform: translate(-100%, 100%);
`;

const StyledDottedMenu = styled(DottedMenuButton)`
  .button-container {
    background-color: ${({ theme }) => theme.whiteBackground};
  }
`;

export enum Phases {
  staking,
  generating,
  drawing,
}

export interface IBaseStakeMaintenanceButton {
  setIsOpen: (open: boolean) => void;
}

interface IStakeMaintenanceButtons {
  className?: string;
}
const StakeMaintenanceButtons: React.FC<IStakeMaintenanceButtons> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prevValue) => !prevValue);
  return (
    <Container {...{ className }}>
      {isOpen ? (
        <>
          <Overlay onClick={() => setIsOpen(false)} />
          <PopupContainer>
            <EnsureChain>
              <>
                <Phase />
                <PassPhaseButton {...{ setIsOpen }} />
                <ExecuteDelayedStakeButton {...{ setIsOpen }} />
              </>
            </EnsureChain>
          </PopupContainer>
        </>
      ) : null}
      <StyledDottedMenu {...{ toggle }} displayRipple={false} />
    </Container>
  );
};

export default StakeMaintenanceButtons;
