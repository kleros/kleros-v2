import React, { useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

import BalanceIcon from "svgs/icons/balance.svg";

import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";

import Popup, { PopupType } from "components/Popup/index";
import Tag from "components/Tag";

import { uncommify } from "utils/commify";

import InputDisplay from "./InputDisplay";
import { ActionType } from "./StakeWithdrawButton";
import Simulator from "./Simulator";

const Container = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      justify-content: space-between;
    `
  )};
`;

const LeftArea = styled.div`
  display: flex;
  flex-direction: column;

  ${landscapeStyle(
    () => css`
      width: 50%;
    `
  )};
`;

const TagArea = styled.div`
  display: flex;
  gap: 10px;
`;

const StakeArea = styled(TagArea)`
  margin-top: 28px;
  flex-direction: column;
`;

const TextArea = styled.div`
  margin-top: 32px;
  color: ${({ theme }) => theme.primaryText};
`;

const StakePanel: React.FC<{ courtName: string; id: string }> = ({ courtName = "General Court", id }) => {
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [action, setAction] = useState<ActionType>(ActionType.stake);

  useLockOverlayScroll(isPopupOpen);

  const handleClick = (action: ActionType) => {
    setIsActive(action === ActionType.stake);
    setAction(action);
  };

  const isStaking = action === ActionType.stake;
  return (
    <Container>
      <LeftArea>
        <TagArea>
          <Tag text="Stake" active={isActive} onClick={() => handleClick(ActionType.stake)} />
          <Tag text="Withdraw" active={!isActive} onClick={() => handleClick(ActionType.withdraw)} />
        </TagArea>
        <TextArea>
          <strong>{`${isStaking ? "Stake" : "Withdraw"} PNK`}</strong> {`${isStaking ? "to join the" : "from"}`}{" "}
          {courtName} court
        </TextArea>
        <StakeArea>
          <InputDisplay {...{ action, isSending, setIsSending, setIsPopupOpen, amount, setAmount }} />
        </StakeArea>
        {isPopupOpen && (
          <Popup
            title={isStaking ? "Stake Confirmed" : "Withdraw Confirmed"}
            icon={BalanceIcon}
            popupType={PopupType.STAKE_WITHDRAW}
            isStake={isStaking}
            pnkStaked={amount}
            courtName={courtName}
            courtId={id}
            setIsOpen={setIsPopupOpen}
            setAmount={setAmount}
          />
        )}
      </LeftArea>
      <Simulator amountToStake={amount ? Number(uncommify(amount)) : 0} {...{ isStaking }} />
    </Container>
  );
};

export default StakePanel;
