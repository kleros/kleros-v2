import React from "react";
import styled, { css, keyframes } from "styled-components";

import { _TimelineItem1, CustomTimeline } from "@kleros/ui-components-library";

import Close from "svgs/icons/close.svg";

import { useSortitionModulePhase } from "hooks/useSortitionModule";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { Divider } from "components/Divider";
import InfoCard from "components/InfoCard";
import LightButton from "components/LightButton";
import { Overlay } from "components/Overlay";
import { Phases } from "components/Phase";

import { ActionType } from "../StakeWithdrawButton";

import Header from "./Header";

const animation = keyframes`
  0%{
    transform: translate(-50%,-47%);
    opacity: 0;
  }
  100%{
    transform: translate(-50%,-50%);
    opacity: 1;
  };
`;

const Container = styled.div`
  display: flex;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;
  position: relative;

  z-index: 10;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 86vw;
  max-width: 600px;
  border-radius: 7px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);
  padding: 8px;

  animation: ${animation} 200ms ease-in;

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
  padding: 16px 24px 24px;
`;

const StyledButton = styled(LightButton)`
  position: absolute;
  top: 8px;
  right: 8px;
  border: none !important;
  padding: 4px !important;
  border-radius: 7px !important;
  height: fit-content !important;
  .button-svg {
    margin: 0;
    path {
      fill: ${({ theme }) => theme.stroke};
    }
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 8px;
`;

const StyledInfoCard = styled(InfoCard)`
  font-size: 14px;
`;
interface IStakeWithdrawPopup {
  action: ActionType;
  amount: string;
  closePopup: () => void;
  steps?: [_TimelineItem1, ..._TimelineItem1[]];
  isSuccess: boolean;
}

const StakeWithdrawPopup: React.FC<IStakeWithdrawPopup> = ({ amount, closePopup, steps, isSuccess, action }) => {
  const { data: phase, isLoading } = useSortitionModulePhase();

  return (
    <Overlay onClick={closePopup}>
      <Container onClick={(e) => e.stopPropagation()}>
        <StyledButton Icon={Close} text="" onClick={closePopup} />
        <InnerContainer>
          <Header {...{ amount, isSuccess, action }} />
          <Divider />
          {steps && <CustomTimeline items={steps} />}
          {phase !== Phases.staking && !isLoading ? (
            <InfoContainer>
              <Divider />
              <StyledInfoCard
                msg={`The ${action === ActionType.stake ? "stake" : "withdraw"} might be delayed by ~1 hr.`}
              />
            </InfoContainer>
          ) : null}
        </InnerContainer>
      </Container>
    </Overlay>
  );
};

export default StakeWithdrawPopup;
