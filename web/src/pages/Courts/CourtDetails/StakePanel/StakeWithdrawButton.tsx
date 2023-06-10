import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { Button } from "@kleros/ui-components-library";
import { usePNKAllowance } from "hooks/queries/usePNKAllowance";
import {
  useKlerosCore,
  useKlerosCoreSetStake,
  usePrepareKlerosCoreSetStake,
  usePnkBalanceOf,
  usePnkIncreaseAllowance,
  usePreparePnkIncreaseAllowance,
} from "hooks/contracts/generated";
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
  parsedAmount: bigint;
  action: ActionType;
  setIsSending: (arg0: boolean) => void;
  setAmount: (arg0: string) => void;
}

const StakeWithdrawButton: React.FC<IActionButton> = ({ parsedAmount, action, setAmount, isSending, setIsSending }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: balance } = usePnkBalanceOf({
    enabled: notUndefined(address),
    args: [address!],
    watch: true,
  });
  const { data: jurorBalance } = useJurorBalance(address, id);
  const { data: allowance } = usePNKAllowance(address);

  const isStaking = action === ActionType.stake;
  const isAllowance = isStaking && allowance && allowance < parsedAmount;

  const targetStake = useMemo(() => {
    if (action === ActionType.stake) {
      return jurorBalance?.staked + parsedAmount;
    } else {
      return jurorBalance?.staked - parsedAmount;
    }
  }, [action, jurorBalance, parsedAmount]);

  const klerosCore = useKlerosCore();
  const { config: increaseAllowanceConfig } = usePreparePnkIncreaseAllowance({
    enabled: notUndefined([klerosCore, targetStake, allowance]),
    args: [klerosCore?.address, targetStake?.sub(allowance ?? BigInt(0))!],
  });
  const { writeAsync: increaseAllowance } = usePnkIncreaseAllowance(increaseAllowanceConfig);
  const handleAllowance = () => {
    if (notUndefined(increaseAllowance)) {
      setIsSending(true);
      wrapWithToast(increaseAllowance!()).finally(() => {
        setIsSending(false);
      });
    }
  };

  const { config: setStakeConfig } = usePrepareKlerosCoreSetStake({
    enabled: notUndefined([targetStake, id]),
    args: [id, targetStake],
  });
  const { writeAsync: setStake } = useKlerosCoreSetStake(setStakeConfig);
  const handleStake = () => {
    if (typeof setStake !== "undefined") {
      setIsSending(true);
      wrapWithToast(setStake())
        .then(() => {
          setAmount("");
        })
        .finally(() => setIsSending(false));
    }
  };

  const buttonProps = {
    [ActionType.allowance]: {
      text: "Allow PNK",
      checkDisabled: () => !balance || targetStake! > balance,
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
      onClick: handleStake,
    },
  };

  const { text, checkDisabled, onClick } = buttonProps[isAllowance ? ActionType.allowance : action];
  return (
    <Button
      text={text}
      isLoading={isSending}
      disabled={isSending || parsedAmount == BigInt(0) || !notUndefined(targetStake) || checkDisabled()}
      onClick={onClick}
    />
  );
};

export default StakeWithdrawButton;
