import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useDebounce } from "react-use";

import { useParsedAmount } from "hooks/useParsedAmount";
import { usePnkData } from "hooks/usePNKData";
import { commify, uncommify } from "utils/commify";
import { formatPNK, roundNumberDown } from "utils/format";
import { isUndefined } from "utils/index";

import { useCourtDetails } from "queries/useCourtDetails";

import { hoverShortTransitionTiming } from "styles/commonStyles";

import { NumberInputField } from "components/NumberInputField";

import StakeWithdrawButton, { ActionType } from "./StakeWithdrawButton";

const StyledField = styled(NumberInputField)`
  height: fit-content;
  input {
    border-radius: 3px 0px 0px 3px;
  }
`;

const LabelArea = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLabel = styled.label`
  ${hoverShortTransitionTiming}
  color: ${({ theme }) => theme.primaryBlue};
  cursor: pointer;

  :hover {
    color: ${({ theme }) => theme.secondaryBlue};
  }
`;

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const InputFieldAndButton = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const EnsureChainContainer = styled.div`
  button {
    height: 45px;
    border: 1px solid ${({ theme }) => theme.stroke};
    border-radius: 0px 3px 3px 0px;
  }
`;

interface IInputDisplay {
  action: ActionType;
  amount: string;
  setAmount: (arg0: string) => void;
}

const InputDisplay: React.FC<IInputDisplay> = ({ action, amount, setAmount }) => {
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);
  const parsedAmount = useParsedAmount(uncommify(debouncedAmount) as `${number}`);

  const { id } = useParams();
  const { balance, jurorBalance } = usePnkData({ courtId: id });
  const { data: courtDetails } = useCourtDetails(id);

  const parsedBalance = formatPNK(balance ?? 0n, 0, true);

  const maxWithdrawAmount = jurorBalance
    ? jurorBalance[2] < jurorBalance[0] - jurorBalance[1]
      ? jurorBalance[2]
      : jurorBalance[0] - jurorBalance[1]
    : 0n;
  const parsedMaxWithdrawAmount = formatPNK(maxWithdrawAmount, 0, true);
  const isStaking = useMemo(() => action === ActionType.stake, [action]);

  useEffect(() => {
    if (parsedAmount > 0n && balance === 0n && isStaking) {
      setErrorMsg("You need a non-zero PNK balance to stake");
    } else if (isStaking && balance && parsedAmount > balance) {
      setErrorMsg("Insufficient balance to stake this amount");
    } else if (!isStaking && jurorBalance && parsedAmount > maxWithdrawAmount) {
      setErrorMsg("Insufficient available amount to withdraw this amount");
    } else if (
      action === ActionType.stake &&
      courtDetails &&
      jurorBalance &&
      parsedAmount !== 0n &&
      jurorBalance[2] + parsedAmount < BigInt(courtDetails?.court?.minStake)
    ) {
      setErrorMsg(`Min Stake in court is: ${formatPNK(courtDetails?.court?.minStake)} PNK`);
    } else {
      setErrorMsg(undefined);
    }
  }, [parsedAmount, isStaking, balance, jurorBalance, action, courtDetails, maxWithdrawAmount]);

  return (
    <>
      <LabelArea>
        <label>{`Available ${isStaking ? parsedBalance : parsedMaxWithdrawAmount} PNK`}</label>
        <StyledLabel
          onClick={() => {
            const amount = isStaking ? parsedBalance : parsedMaxWithdrawAmount;
            setAmount(amount);
          }}
        >
          {isStaking ? "Stake" : "Withdraw"} all
        </StyledLabel>
      </LabelArea>
      <InputArea>
        <InputFieldAndButton>
          <StyledField
            value={uncommify(amount)}
            onChange={(e) => {
              setAmount(e);
            }}
            placeholder={isStaking ? "Amount to stake" : "Amount to withdraw"}
            message={isPopupOpen ? undefined : (errorMsg ?? undefined)}
            variant={!isUndefined(errorMsg) && !isPopupOpen ? "error" : "info"}
            formatter={(number: string) => (number !== "" ? commify(roundNumberDown(Number(number))) : "")}
          />
          <EnsureChainContainer>
            <StakeWithdrawButton
              {...{
                amount,
                parsedAmount,
                action,
                setAmount,
                setErrorMsg,
                isPopupOpen,
                setIsPopupOpen,
              }}
            />
          </EnsureChainContainer>
        </InputFieldAndButton>
      </InputArea>
    </>
  );
};

export default InputDisplay;
