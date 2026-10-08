import React, { useState, useMemo, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useDebounce } from "react-use";

import { BigNumberField } from "@kleros/ui-components-library";

import { useBigNumberFieldReset } from "hooks/useBigNumberFieldReset";
import { useParsedAmount } from "hooks/useParsedAmount";
import { usePnkData } from "hooks/usePNKData";
import { uncommify } from "utils/commify";
import { formatPNK } from "utils/format";
import { isUndefined } from "utils/index";

import { useCourtDetails } from "queries/useCourtDetails";

import StakeWithdrawButton, { ActionType } from "./StakeWithdrawButton";

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
  const { key: fieldKey, inputRef } = useBigNumberFieldReset(amount);
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);
  const parsedAmount = useParsedAmount(debouncedAmount as `${number}`);

  const { id } = useParams();
  const { balance, jurorBalance } = usePnkData({ courtId: id });
  const { data: courtDetails } = useCourtDetails(id);

  const parsedBalance = formatPNK(balance ?? 0n, 0, true);

  const parsedStake = formatPNK(jurorBalance?.[2] ?? 0n, 0, true);
  const isStaking = useMemo(() => action === ActionType.stake, [action]);
  const placeholder = isStaking ? t("forms.placeholders.amount_to_stake") : t("forms.placeholders.amount_to_withdraw");

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
      courtDetails?.court?.minStake &&
      jurorBalance[2] + parsedAmount < BigInt(courtDetails?.court?.minStake)
    ) {
      setErrorMsg(t("forms.messages.min_stake_in_court", { amount: formatPNK(BigInt(courtDetails?.court?.minStake)) }));
    } else {
      setErrorMsg(undefined);
    }
  }, [parsedAmount, isStaking, balance, jurorBalance, action, courtDetails, t]);

  return (
    <>
      <div className="flex justify-between">
        <label>{t("staking.available_amount", { amount: isStaking ? parsedBalance : parsedStake })}</label>
        <label
          onClick={() => {
            setAmount(uncommify(isStaking ? parsedBalance : parsedStake));
          }}
          className="[transition:0.1s] text-klerosUIComponentsPrimaryBlue cursor-pointer [&:hover]:text-klerosUIComponentsSecondaryBlue"
        >
          {isStaking ? t("staking.stake_all") : t("staking.withdraw_all")}
        </label>
      </div>
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex flex-row w-full">
          <BigNumberField
            key={fieldKey}
            inputRef={inputRef}
            // `amount` is the decimal string viem's parseUnits consumes.
            // TODO(ui-components-library): drop the `isZero` mapping and `|| undefined` once the
            // field reports an emptied input as empty (same issue as useBigNumberFieldReset).
            value={amount || undefined}
            onChange={(value) => setAmount(value.isZero() ? "" : value.toString())}
            minValue="0"
            isWheelDisabled
            inputProps={{ "aria-label": placeholder }}
            placeholder={placeholder}
            message={isPopupOpen ? undefined : (errorMsg ?? undefined)}
            variant={!isUndefined(errorMsg) && !isPopupOpen ? "error" : "info"}
            className="w-full [&&_input]:rounded-[3px_0_0_3px] [&_input:focus]:relative [&_input:focus]:z-1"
          />
          <div className="[&_button]:h-[45px] [&_button]:border [&_button]:border-solid [&_button]:border-klerosUIComponentsStroke [&_button]:border-l-0 [&_button]:rounded-[0px_3px_3px_0px]">
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
          </div>
        </div>
      </div>
    </>
  );
};

export default InputDisplay;
