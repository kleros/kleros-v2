import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount, usePublicClient } from "wagmi";
import { Button } from "@kleros/ui-components-library";
import {
  getKlerosCore,
  useKlerosCoreSetStake,
  usePrepareKlerosCoreSetStake,
  usePnkBalanceOf,
  usePnkIncreaseAllowance,
  usePreparePnkIncreaseAllowance,
  useKlerosCoreGetJurorBalance,
  usePnkAllowance,
} from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";
import { isUndefined } from "utils/index";
import { EnsureChain } from "components/EnsureChain";

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
  const klerosCore = getKlerosCore({});
  const { data: balance } = usePnkBalanceOf({
    enabled: !isUndefined(address),
    args: [address!],
    watch: true,
  });
  const { data: jurorBalance } = useKlerosCoreGetJurorBalance({
    enabled: !isUndefined(address),
    args: [address ?? "0x", BigInt(id ?? 0)],
    watch: true,
  });
  const { data: allowance } = usePnkAllowance({
    enabled: !isUndefined(address),
    args: [address ?? "0x", klerosCore.address],
    watch: true,
  });
  const publicClient = usePublicClient();

  const isStaking = action === ActionType.stake;
  const isAllowance = isStaking && !isUndefined(allowance) && allowance < parsedAmount;

  const targetStake = useMemo(() => {
    if (jurorBalance) {
      if (isAllowance) {
        return parsedAmount;
      } else if (isStaking) {
        return jurorBalance[0] + parsedAmount;
      } else {
        return jurorBalance[0] - parsedAmount;
      }
    }
    return 0n;
  }, [jurorBalance, parsedAmount, isAllowance, isStaking]);

  const { config: increaseAllowanceConfig } = usePreparePnkIncreaseAllowance({
    enabled: isAllowance && !isUndefined(klerosCore) && !isUndefined(targetStake) && !isUndefined(allowance),
    args: [klerosCore?.address, BigInt(targetStake ?? 0) - BigInt(allowance ?? 0)],
  });
  const { writeAsync: increaseAllowance } = usePnkIncreaseAllowance(increaseAllowanceConfig);
  const handleAllowance = () => {
    if (!isUndefined(increaseAllowance)) {
      setIsSending(true);
      wrapWithToast(async () => await increaseAllowance().then((response) => response.hash), publicClient).finally(
        () => {
          setIsSending(false);
        }
      );
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
      wrapWithToast(async () => await setStake().then((response) => response.hash), publicClient)
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
    <EnsureChain>
      <Button
        text={text}
        isLoading={isSending}
        disabled={isSending || parsedAmount == 0n || !!isUndefined(targetStake) || checkDisabled()}
        onClick={onClick}
      />
    </EnsureChain>
  );
};

export default StakeWithdrawButton;
