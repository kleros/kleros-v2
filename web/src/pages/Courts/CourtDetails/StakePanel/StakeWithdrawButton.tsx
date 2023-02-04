import React from "react";
import { useParams } from "react-router-dom";
import { BigNumber } from "ethers";
import { Button } from "@kleros/ui-components-library";

import { KlerosCore } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/KlerosCore";
import { PNK } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/mock/PNK";

import { useWeb3 } from "hooks/useWeb3";
import { useConnectedContract } from "hooks/useConnectedContract";
import { usePNKAllowance } from "queries/usePNKAllowance";
import { usePNKBalance } from "queries/usePNKBalance";
import { useJurorBalance } from "queries/useJurorBalance";
import { wrapWithToast } from "utils/wrapWithToast";

export enum ActionType {
  allowance = "allowance",
  stake = "stake",
  withdraw = "withdraw",
}

interface IActionButton {
  isSending: boolean;
  parsedAmount: BigNumber;
  action: ActionType;
  setIsSending: (arg0: boolean) => void;
  setAmount: (arg0: string) => void;
}

const StakeWithdrawButton: React.FC<IActionButton> = ({
  parsedAmount,
  action,
  setAmount,
  isSending,
  setIsSending,
}) => {
  const { id } = useParams();
  const { account } = useWeb3();
  const { data: allowance, mutate } = usePNKAllowance(account);
  const { data: balance } = usePNKBalance(account);
  const { data: jurorBalance } = useJurorBalance(account, id);
  const klerosCore = useConnectedContract("KlerosCore") as KlerosCore;
  const pnk = useConnectedContract("PNK") as PNK;

  const isStaking = action === ActionType.stake;
  const isAllowance = isStaking && allowance && allowance.lt(parsedAmount);

  const handleAllowance = () => {
    setIsSending(true);
    wrapWithToast(
      pnk.increaseAllowance(klerosCore.address, parsedAmount.sub(allowance!))
    ).finally(() => {
      setIsSending(false);
      mutate();
    });
  };

  const handleStake = () => {
    if (typeof id !== "undefined") {
      setIsSending(true);
      wrapWithToast(klerosCore.setStake(id, parsedAmount))
        .then(() => {
          setAmount("");
        })
        .finally(() => setIsSending(false));
    }
  };

  const handleWithdraw = () => {
    if (typeof id !== "undefined") {
      setIsSending(true);
      const withdrawAmount = jurorBalance?.staked.sub(parsedAmount);
      withdrawAmount &&
        wrapWithToast(klerosCore.setStake(id, withdrawAmount))
          .then(() => {
            setAmount("");
            close();
          })
          .finally(() => setIsSending(false));
    }
  };

  const buttonProps = {
    [ActionType.allowance]: {
      text: "Allow PNK",
      disabled:
        !balance ||
        isSending ||
        parsedAmount.eq(BigNumber.from(0)) ||
        parsedAmount.gt(balance),
      onClick: handleAllowance,
    },
    [ActionType.stake]: {
      text: "Stake",
      disabled: isSending || parsedAmount.eq(BigNumber.from(0)),
      onClick: handleStake,
    },
    [ActionType.withdraw]: {
      text: "Withdraw",
      disabled: isSending || parsedAmount.eq(BigNumber.from(0)),
      onClick: handleWithdraw,
    },
  };

  const { text, disabled, onClick } =
    buttonProps[isAllowance ? ActionType.allowance : action];
  return (
    <Button
      text={text}
      isLoading={isSending}
      disabled={disabled}
      onClick={onClick}
    />
  );
};

export default StakeWithdrawButton;
