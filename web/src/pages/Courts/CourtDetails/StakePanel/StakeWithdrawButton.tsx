import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useNetwork } from "wagmi";
import { Button } from "@kleros/ui-components-library";
import { usePNKAllowance } from "hooks/queries/usePNKAllowance";
import {
  getKlerosCore,
  useKlerosCoreSetStake,
  usePrepareKlerosCoreSetStake,
  usePnkBalanceOf,
  usePnkIncreaseAllowance,
  usePreparePnkIncreaseAllowance,
} from "hooks/contracts/generated";
import { useJurorBalance } from "queries/useJurorBalance";
import { wrapWithToast } from "utils/wrapWithToast";
import { isUndefined } from "utils/index";
import { DEFAULT_CHAIN } from "consts/chains";
import ConnectButton from "components/ConnectButton";

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
  const { chain } = useNetwork();
  const { data: balance } = usePnkBalanceOf({
    enabled: !isUndefined(address),
    args: [address!],
    watch: true,
  });
  const { data: jurorBalance } = useJurorBalance(address, id);
  const { data: allowance } = usePNKAllowance(address);

  const isStaking = action === ActionType.stake;
  const isAllowance = isStaking && allowance && allowance < parsedAmount;

  const targetStake = useMemo(() => {
    if (jurorBalance) {
      if (action === ActionType.stake) {
        return jurorBalance[0] + parsedAmount;
      } else {
        return jurorBalance[0] - parsedAmount;
      }
    }
  }, [action, jurorBalance, parsedAmount]);

  const klerosCore = getKlerosCore({});
  const { config: increaseAllowanceConfig } = usePreparePnkIncreaseAllowance({
    enabled: !isUndefined([klerosCore, targetStake, allowance]),
    args: [klerosCore?.address, BigInt(targetStake ?? 0) - BigInt(allowance ?? 0)],
  });
  const { writeAsync: increaseAllowance } = usePnkIncreaseAllowance(increaseAllowanceConfig);
  const handleAllowance = () => {
    if (!isUndefined(increaseAllowance)) {
      setIsSending(true);
      wrapWithToast(increaseAllowance!()).finally(() => {
        setIsSending(false);
      });
    }
  };

  const { config: setStakeConfig } = usePrepareKlerosCoreSetStake({
    enabled: !isUndefined(targetStake) && !isUndefined(id),
    args: [BigInt(id ?? 0), targetStake],
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
    <>
      {chain && chain.id === DEFAULT_CHAIN ? (
        <Button
          text={text}
          isLoading={isSending}
          disabled={isSending || parsedAmount == 0n || !!isUndefined(targetStake) || checkDisabled()}
          onClick={onClick}
        />
      ) : (
        <ConnectButton />
      )}
    </>
  );
};

export default StakeWithdrawButton;
