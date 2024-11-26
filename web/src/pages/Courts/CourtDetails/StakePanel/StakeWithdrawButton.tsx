import React, { useCallback, useEffect, useMemo } from "react";

import { useParams } from "react-router-dom";
import { useAccount, usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import { REFETCH_INTERVAL } from "consts/index";
import {
  klerosCoreAddress,
  useSimulateKlerosCoreSetStake,
  useWriteKlerosCoreSetStake,
  useReadPnkBalanceOf,
  useSimulatePnkIncreaseAllowance,
  useWritePnkIncreaseAllowance,
  useReadSortitionModuleGetJurorBalance,
  useReadPnkAllowance,
} from "hooks/contracts/generated";
import { useCourtDetails } from "hooks/queries/useCourtDetails";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";

import { EnsureChain } from "components/EnsureChain";
import styled from "styled-components";

export enum ActionType {
  allowance = "allowance",
  stake = "stake",
  withdraw = "withdraw",
}

const Container = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

interface IActionButton {
  isSending: boolean;
  parsedAmount: bigint;
  action: ActionType;
  setIsSending: (arg0: boolean) => void;
  setAmount: (arg0: string) => void;
  setIsPopupOpen: (arg0: boolean) => void;
  setErrorMsg: (msg: string) => void;
}

const StakeWithdrawButton: React.FC<IActionButton> = ({
  parsedAmount,
  action,
  isSending,
  setIsSending,
  setIsPopupOpen,
  setErrorMsg,
}) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: courtDetails } = useCourtDetails(id);
  const { data: balance } = useReadPnkBalanceOf({
    query: {
      enabled: !isUndefined(address),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [address!],
  });
  const { data: jurorBalance } = useReadSortitionModuleGetJurorBalance({
    query: {
      enabled: !isUndefined(address),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [address ?? "0x", BigInt(id ?? 0)],
  });
  const { data: allowance } = useReadPnkAllowance({
    query: {
      enabled: !isUndefined(address),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [address ?? "0x", klerosCoreAddress[DEFAULT_CHAIN]],
  });
  const publicClient = usePublicClient();

  const isStaking = action === ActionType.stake;
  const isAllowance = isStaking && !isUndefined(allowance) && allowance < parsedAmount;

  const targetStake = useMemo(() => {
    if (jurorBalance) {
      if (isAllowance) {
        return parsedAmount;
      } else if (isStaking) {
        return jurorBalance[2] + parsedAmount;
      } else {
        return jurorBalance[2] - parsedAmount;
      }
    }
    return 0n;
  }, [jurorBalance, parsedAmount, isAllowance, isStaking]);

  const { data: increaseAllowanceConfig } = useSimulatePnkIncreaseAllowance({
    query: {
      enabled: isAllowance && !isUndefined(targetStake) && !isUndefined(allowance),
    },
    args: [klerosCoreAddress[DEFAULT_CHAIN], BigInt(targetStake ?? 0) - BigInt(allowance ?? 0)],
  });

  const { writeContractAsync: increaseAllowance } = useWritePnkIncreaseAllowance();

  const handleAllowance = useCallback(() => {
    if (increaseAllowanceConfig && publicClient) {
      setIsSending(true);
      wrapWithToast(async () => await increaseAllowance(increaseAllowanceConfig.request), publicClient).finally(() => {
        setIsSending(false);
      });
    }
  }, [setIsSending, increaseAllowance, increaseAllowanceConfig, publicClient]);

  const { data: setStakeConfig, error: setStakeError } = useSimulateKlerosCoreSetStake({
    query: {
      enabled:
        !isUndefined(targetStake) && !isUndefined(id) && !isAllowance && parsedAmount !== 0n && targetStake >= 0n,
    },
    args: [BigInt(id ?? 0), targetStake],
  });
  const { writeContractAsync: setStake } = useWriteKlerosCoreSetStake();

  const handleStake = useCallback(() => {
    if (setStakeConfig && publicClient) {
      setIsSending(true);
      wrapWithToast(async () => await setStake(setStakeConfig.request), publicClient)
        .then((res) => setIsPopupOpen(res.status))
        .finally(() => {
          setIsSending(false);
        });
    }
  }, [setIsSending, setStake, setStakeConfig, publicClient, setIsPopupOpen]);

  const buttonProps = {
    [ActionType.allowance]: {
      text: "Allow PNK",
      checkDisabled: () => !balance || targetStake > balance,
      onClick: handleAllowance,
    },
    [ActionType.stake]: {
      text: "Stake",
      checkDisabled: () => !isUndefined(setStakeError),
      onClick: handleStake,
    },
    [ActionType.withdraw]: {
      text: "Withdraw",
      checkDisabled: () => !jurorBalance || parsedAmount > jurorBalance[2],
      onClick: handleStake,
    },
  };

  useEffect(() => {
    if (setStakeError) {
      setErrorMsg(setStakeError?.shortMessage ?? setStakeError.message);
    }
  }, [setStakeError]);

  const { text, checkDisabled, onClick } = buttonProps[isAllowance ? ActionType.allowance : action];
  return (
    <EnsureChain>
      <Container>
        <Button
          text={text}
          isLoading={isSending}
          disabled={
            isSending ||
            parsedAmount == 0n ||
            isUndefined(targetStake) ||
            isUndefined(courtDetails) ||
            checkDisabled() ||
            (targetStake !== 0n && targetStake < BigInt(courtDetails.court?.minStake)) ||
            (isStaking && !isAllowance && isUndefined(setStakeConfig))
          }
          onClick={onClick}
        />
      </Container>
    </EnsureChain>
  );
};

export default StakeWithdrawButton;
