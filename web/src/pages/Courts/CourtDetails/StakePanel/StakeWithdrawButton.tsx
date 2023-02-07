import React, { useMemo } from "react";
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
import { notUndefined } from "utils/index";

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

  const targetStake = useMemo(() => {
    if (action === ActionType.stake || action === ActionType.allowance) {
      return jurorBalance?.staked.add(parsedAmount);
    } else {
      return jurorBalance?.staked.sub(parsedAmount);
    }
  }, [action, jurorBalance, parsedAmount]);

  const handleAllowance = () => {
    setIsSending(true);
    wrapWithToast(
      pnk.increaseAllowance(klerosCore.address, targetStake!.sub(allowance!))
    ).finally(() => {
      setIsSending(false);
      mutate(undefined, true);
    });
  };

  const handleStake = () => {
    if (typeof id !== "undefined") {
      setIsSending(true);
      wrapWithToast(klerosCore.setStake(id, targetStake!))
        .then(() => {
          setAmount("");
        })
        .finally(() => setIsSending(false));
    }
  };

  const handleWithdraw = () => {
    if (typeof id !== "undefined") {
      setIsSending(true);
      wrapWithToast(klerosCore.setStake(id, targetStake!))
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
      checkDisabled: () => !balance || targetStake!.gt(balance),
      onClick: handleAllowance,
    },
    [ActionType.stake]: {
      text: "Stake",
      checkDisabled: () => false,
      onClick: handleStake,
    },
    [ActionType.withdraw]: {
      text: "Withdraw",
      checkDisabled: () => false,
      onClick: handleWithdraw,
    },
  };

  const { text, checkDisabled, onClick } =
    buttonProps[isAllowance ? ActionType.allowance : action];
  return (
    <Button
      text={text}
      isLoading={isSending}
      disabled={
        isSending ||
        parsedAmount.eq(BigNumber.from(0)) ||
        !notUndefined(targetStake) ||
        checkDisabled()
      }
      onClick={onClick}
    />
  );
};

export default StakeWithdrawButton;
