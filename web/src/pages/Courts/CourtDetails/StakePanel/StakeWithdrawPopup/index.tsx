import React from "react";
import styled, { css } from "styled-components";

import { _TimelineItem1, CustomTimeline } from "@kleros/ui-components-library";

import Close from "svgs/icons/close.svg";

import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { Divider } from "components/Divider";
import LightButton from "components/LightButton";
import { Overlay } from "components/Overlay";

import { ActionType } from "../StakeWithdrawButton";

import Header from "./Header";

const Container = styled.div`
  display: flex;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;

  z-index: 10;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 86vw;
  max-width: 600px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);
  padding: 8px;

  svg {
    visibility: visible;
  }

  ${landscapeStyle(
    () => css`
      overflow-y: hidden;
      width: ${responsiveSize(300, 600)};
    `
  )}
`;

const InnerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-self: center;
  gap: 24px;
  padding: 24px;
`;

const StyledButton = styled(LightButton)`
  border: none !important;
  padding: 8px !important;
  border-radius: 7px !important;
  height: fit-content !important;
  align-self: end;
`;

const CloseIcon = styled(Close)`
  fill: ${({ theme }) => theme.stroke};
`;

interface IStakeWithdrawPopup {
  action: ActionType;
  amount: string;
  closePopup: () => void;
  steps?: { items?: [_TimelineItem1, ..._TimelineItem1[]]; current: number };
  isSuccess: boolean;
}

const StakeWithdrawPopup: React.FC<IStakeWithdrawPopup> = ({ amount, closePopup, steps, isSuccess, action }) => {
  useLockOverlayScroll(true);
  return (
    <Overlay onClick={closePopup}>
      <Container onClick={(e) => e.stopPropagation()}>
        <StyledButton Icon={CloseIcon} text="" onClick={closePopup} />
        <InnerContainer>
          <Header {...{ amount, isSuccess, action }} />
          <Divider />
          {steps?.items && <CustomTimeline items={steps.items} />}
        </InnerContainer>
      </Container>
    </Overlay>
  );
};

export default StakeWithdrawPopup;
