import React, { useState } from "react";
import styled, { css } from "styled-components";

import { uncommify } from "utils/commify";

import { landscapeStyle } from "styles/landscapeStyle";

import Tag from "components/Tag";

import InputDisplay from "./InputDisplay";
import { ActionType } from "./StakeWithdrawButton";
import Simulator from "./Simulator";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${landscapeStyle(
    () => css`
      gap: 24px;
      flex-direction: column;
    `
  )};
`;

const StakingArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TagArea = styled.div`
  display: flex;
  gap: 10px;
`;

const InputArea = styled(TagArea)`
  flex-direction: column;
`;

const TextArea = styled.div`
  color: ${({ theme }) => theme.primaryText};
`;

const StakePanel: React.FC<{ courtName: string }> = ({ courtName = "General Court" }) => {
  const [amount, setAmount] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [action, setAction] = useState<ActionType>(ActionType.stake);

  const handleClick = (action: ActionType) => {
    setIsActive(action === ActionType.stake);
    setAction(action);
  };

  const isStaking = action === ActionType.stake;
  return (
    <Container>
      <StakingArea>
        <TagArea>
          <Tag text="Stake" active={isActive} onClick={() => handleClick(ActionType.stake)} />
          <Tag text="Withdraw" active={!isActive} onClick={() => handleClick(ActionType.withdraw)} />
        </TagArea>
        <TextArea>
          <strong>{`${isStaking ? "Stake" : "Withdraw"} PNK`}</strong> {`${isStaking ? "to join the" : "from"}`}{" "}
          {courtName}
          {courtName.toLowerCase().endsWith("court") || courtName.toLowerCase().startsWith("corte") ? null : " Court"}
        </TextArea>
        <InputArea>
          <InputDisplay {...{ action, amount, setAmount }} />
        </InputArea>
      </StakingArea>
      <Simulator amountToStake={amount ? Number(uncommify(amount)) : 0} {...{ isStaking }} />
    </Container>
  );
};

export default StakePanel;
