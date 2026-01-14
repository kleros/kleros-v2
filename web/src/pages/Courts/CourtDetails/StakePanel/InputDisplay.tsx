import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);
  const parsedAmount = useParsedAmount(uncommify(debouncedAmount) as `${number}`);

  const { id } = useParams();
  const { balance, jurorBalance } = usePnkData({ courtId: id });
  const { data: courtDetails } = useCourtDetails(id);

  const parsedBalance = formatPNK(balance ?? 0n, 0, true);

  const parsedStake = formatPNK(jurorBalance?.[2] ?? 0n, 0, true);
  const isStaking = useMemo(() => action === ActionType.stake, [action]);

  useEffect(() => {
    if (parsedAmount > 0n && balance === 0n && isStaking) {
      setErrorMsg(t("forms.messages.you_need_non_zero_pnk"));
    } else if (isStaking && balance && parsedAmount > balance) {
      setErrorMsg(t("forms.messages.insufficient_balance_to_stake"));
    } else if (!isStaking && jurorBalance && parsedAmount > jurorBalance[2]) {
      setErrorMsg(t("forms.messages.insufficient_staked_amount"));
    } else if (
      action === ActionType.stake &&
      courtDetails &&
      jurorBalance &&
      parsedAmount !== 0n &&
      jurorBalance[2] + parsedAmount < BigInt(courtDetails?.court?.minStake)
    ) {
      setErrorMsg(t("forms.messages.min_stake_in_court", { amount: formatPNK(courtDetails?.court?.minStake) }));
    } else {
      setErrorMsg(undefined);
    }
  }, [parsedAmount, isStaking, balance, jurorBalance, action, courtDetails, t]);

  return (
    <>
      <LabelArea>
        <label>{`${t("staking.available")} ${isStaking ? parsedBalance : parsedStake} PNK`}</label>
        <StyledLabel
          onClick={() => {
            const amount = isStaking ? parsedBalance : parsedStake;
            setAmount(amount);
          }}
        >
          {isStaking ? t("staking.stake_all") : t("staking.withdraw_all")}
        </StyledLabel>
      </LabelArea>
      <InputArea>
        <InputFieldAndButton>
          <StyledField
            value={uncommify(amount)}
            onChange={(e) => {
              setAmount(e);
            }}
            placeholder={
              isStaking ? t("forms.placeholders.amount_to_stake") : t("forms.placeholders.amount_to_withdraw")
            }
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
