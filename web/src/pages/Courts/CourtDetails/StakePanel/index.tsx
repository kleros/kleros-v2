import React, { useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

import { useAccount } from "wagmi";
import { formatEther } from "viem";

import BalanceIcon from "svgs/icons/balance.svg";
import ThreePnksIcon from "svgs/styled/three-pnks.svg";

import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { useReadSortitionModuleGetJurorBalance } from "hooks/contracts/generated";

import Popup, { PopupType } from "components/Popup/index";
import Tag from "components/Tag";

import { uncommify } from "utils/commify";
import { isUndefined } from "utils/index";
import { REFETCH_INTERVAL } from "consts/index";

import InputDisplay from "./InputDisplay";
import JurorBalanceDisplay from "./JurorStakeDisplay";
import { ActionType } from "./StakeWithdrawButton";
import SimulatorPopup from "./SimulatorPopup";

const Container = styled.div`
  position: relative;
  width: 100%;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
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

const ThreePnksIconContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-items: center;

  ${landscapeStyle(
    () => css`
      width: 50%;
      justify-content: flex-end;
      align-items: flex-end;
      margin-bottom: 42px;
      margin-right: 52px;
    `
  )};
`;

const StakePanel: React.FC<{ courtName: string; id: string }> = ({ courtName = "General Court", id }) => {
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [action, setAction] = useState<ActionType>(ActionType.stake);
  const { address } = useAccount();
  const { data: jurorBalance } = useReadSortitionModuleGetJurorBalance({
    query: {
      enabled: !isUndefined(address),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [address ?? "0x", BigInt(id ?? 0)],
  });

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
          <JurorBalanceDisplay {...{ jurorBalance }} />
        </StakeArea>
        {isStaking && Number(uncommify(amount)) > 0 ? (
          <SimulatorPopup
            stakingAmount={
              !isUndefined(jurorBalance)
                ? Number(formatEther(jurorBalance?.[2])) + Number(uncommify(amount))
                : Number(uncommify(amount))
            }
          />
        ) : null}
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
      <ThreePnksIconContainer>
        <ThreePnksIcon />
      </ThreePnksIconContainer>
    </Container>
  );
};

export default StakePanel;
