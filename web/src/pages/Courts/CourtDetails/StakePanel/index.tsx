import React, { useState } from "react";
import styled from "styled-components";
import { useLockBodyScroll } from "react-use";
import Tag from "components/Tag";
import JurorBalanceDisplay from "./JurorStakeDisplay";
import InputDisplay from "./InputDisplay";
import { ActionType } from "./StakeWithdrawButton";
import Popup, { PopupType } from "components/Popup/index";
import BalanceIcon from "assets/svgs/icons/balance.png";

const StakePanel: React.FC<{ courtName: string; id: string }> = ({ courtName = "General Court", id }) => {
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [action, setAction] = useState<ActionType>(ActionType.stake);

  useLockBodyScroll(isPopupOpen);

  const handleClick = (action: ActionType) => {
    setIsActive(action === ActionType.stake);
    setAction(action);
  };

  const isStaking = action === ActionType.stake;
  return (
    <Container>
      <TagArea>
        <Tag text="Stake" active={isActive} onClick={() => handleClick(ActionType.stake)} />
        <Tag text="Withdraw" active={!isActive} onClick={() => handleClick(ActionType.withdraw)} />
      </TagArea>
      <TextArea>
        <strong>{`${isStaking ? "Stake" : "Withdraw"} PNK`}</strong> {`${isStaking ? "to join the" : "from"}`}{" "}
        {courtName} court.
      </TextArea>
      <StakeArea>
        <InputDisplay {...{ action, isSending, setIsSending, setIsPopupOpen, amount, setAmount }} />
        <JurorBalanceDisplay />
      </StakeArea>
      {isPopupOpen && (
        <Popup
          title={isStaking ? "Stake Confirmed" : "Withdraw Confirmed"}
          icon={BalanceIcon}
          popupType={PopupType.STAKE_WITHDRAW}
          isStake={isStaking}
          pnkStaked={amount ? amount : ""}
          courtName={courtName}
          courtId={id}
          setIsOpen={setIsPopupOpen}
          setAmount={setAmount}
        />
      )}
    </Container>
  );
};

export default StakePanel;

const Container = styled.div`
  position: relative;
  width: 100%;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const TagArea = styled.div`
  display: flex;
  gap: 10px;
`;

const StakeArea = styled(TagArea)`
  flex-direction: column;
`;

const TextArea = styled.div`
  color: ${({ theme }) => theme.primaryText};
`;
