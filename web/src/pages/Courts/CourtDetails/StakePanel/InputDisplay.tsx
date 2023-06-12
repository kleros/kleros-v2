import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { formatEther } from "viem";
import { useDebounce } from "react-use";
import { useAccount } from "wagmi";
import { Button, Field } from "@kleros/ui-components-library";

import { useParsedAmount } from "hooks/useParsedAmount";
import { usePNKBalance } from "queries/usePNKBalance";
import { useJurorBalance } from "queries/useJurorBalance";
import StakeWithdrawButton, { ActionType } from "./StakeWithdrawButton";

interface IInputDisplay {
  action: ActionType;
  isSending: boolean;
  setIsSending: (arg0: boolean) => void;
}

const InputDisplay: React.FC<IInputDisplay> = ({ action, isSending, setIsSending }) => {
  const [amount, setAmount] = useState("");
  const [debouncedAmount, setDebouncedAmount] = useState("");
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);
  const parsedAmount = useParsedAmount(debouncedAmount);

  const { id } = useParams();
  const { address } = useAccount();
  const { data: balance } = usePNKBalance(address);
  const parsedBalance = formatEther(balance!);
  const { data: jurorBalance } = useJurorBalance(address, id);
  const parsedStake = formatEther((jurorBalance && jurorBalance[0]) || BigInt(0));
  const isStaking = action === ActionType.stake;

  return (
    <>
      <LabelArea>
        <label>{`Available ${parsedBalance} PNK`}</label>
        <StyledLabel
          onClick={() => {
            const amount = isStaking ? parsedBalance : parsedStake;
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
          message={
            isStaking ? "You may need two transactions, one to increase allowance, the other to stake." : undefined
          }
          variant="info"
        />
        {address ? (
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
          <Button text="Connect to Stake" />
        )}
      </InputArea>
    </>
  );
};

export default InputDisplay;

const StyledField = styled(Field)`
  width: 100%;
  height: fit-content;
`;

const LabelArea = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryBlue};
  cursor: pointer;
`;

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;
