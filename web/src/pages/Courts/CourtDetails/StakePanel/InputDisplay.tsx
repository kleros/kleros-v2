import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { utils } from "ethers";
import { Button, Field } from "@kleros/ui-components-library";

import { useWeb3 } from "hooks/useWeb3";
import { useConnect } from "hooks/useConnect";
import { useParsedAmount } from "hooks/useParsedAmount";
import { usePNKBalance } from "hooks/queries/usePNKBalance";
import { useJurorBalance } from "hooks/useJurorBalance";
import StakeWithdrawButton, { ActionType } from "./StakeWithdrawButton";

interface IInputDisplay {
  action: ActionType;
  isSending: boolean;
  setIsSending: (arg0: boolean) => void;
}

const InputDisplay: React.FC<IInputDisplay> = ({
  action,
  isSending,
  setIsSending,
}) => {
  const [amount, setAmount] = useState("");
  const parsedAmount = useParsedAmount(amount);

  const { id } = useParams();
  const { account } = useWeb3();
  const { data: balance } = usePNKBalance(account);
  const parsedBalance = utils.formatEther(balance || 0);
  const { staked } = useJurorBalance(account, id);
  const { activate, connecting } = useConnect();
  const isStaking = action === ActionType.stake;

  return (
    <>
      <LabelArea>
        <label>{`Available ${parsedBalance} PNK`}</label>
        <StyledLabel
          onClick={() => {
            const amount = isStaking ? parsedBalance : staked;
            setAmount(amount);
          }}
        >
          {isStaking ? "Stake" : "Withdraw"} all
        </StyledLabel>
      </LabelArea>
      <InputArea>
        <StyledField
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
          placeholder={isStaking ? "Amount to stake" : "Amount to withdraw"}
        />
        {account ? (
          <StakeWithdrawButton
            {...{
              parsedAmount,
              action,
              setAmount,
              isSending,
              setIsSending,
            }}
          />
        ) : (
          <Button
            text="Connect to Stake"
            onClick={activate}
            disabled={connecting}
          />
        )}
      </InputArea>
    </>
  );
};

export default InputDisplay;

const StyledField = styled(Field)`
  width: 100%;
`;

const LabelArea = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryBlue};
`;

const InputArea = styled(LabelArea)``;
