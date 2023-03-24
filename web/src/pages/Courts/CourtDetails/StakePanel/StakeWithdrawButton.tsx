import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { BigNumber } from "ethers";
import { Button } from "@kleros/ui-components-library";
import { useAccount } from "wagmi";

import {
  useKlerosCore,
  useKlerosCoreSetStake,
  usePrepareKlerosCoreSetStake,
  usePnkAllowance,
  usePnkIncreaseAllowance,
  usePreparePnkIncreaseAllowance,
} from "hooks/contracts/generated";

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
  const { address } = useAccount();
  const { data: balance } = usePNKBalance(address);
  const { data: jurorBalance } = useJurorBalance(address, id);
  const { data: allowance } = usePnkAllowance({
    enabled: notUndefined(address),
    args: [address!],
    watch: true,
    cacheOnBlock: true,
  });

  const isStaking = action === ActionType.stake;
  const isAllowance = isStaking && allowance && allowance.lt(parsedAmount);

  const targetStake = useMemo(() => {
    if (action === ActionType.stake || action === ActionType.allowance) {
      return jurorBalance?.staked.add(parsedAmount);
    } else {
      return jurorBalance?.staked.sub(parsedAmount);
    }
  }, [action, jurorBalance, parsedAmount]);

  const klerosCore = useKlerosCore();
  const { config: increaseAllowanceConfig } = usePreparePnkIncreaseAllowance({
    enabled: notUndefined([klerosCore, targetStake, allowance]),
    args: [klerosCore!.address, targetStake!.sub(allowance!)],
  });
  const { writeAsync: increaseAllowance } = usePnkIncreaseAllowance(
    increaseAllowanceConfig
  );
  const handleAllowance = () => {
    if (notUndefined(increaseAllowance)) {
      setIsSending(true);
      wrapWithToast(increaseAllowance!()).finally(() => {
        setIsSending(false);
      });
    }
  };

  const { config: setStakeConfig } = usePrepareKlerosCoreSetStake({
    enabled: notUndefined(targetStake),
    args: [targetStake!, targetStake!],
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
      onClick: handleStake,
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
