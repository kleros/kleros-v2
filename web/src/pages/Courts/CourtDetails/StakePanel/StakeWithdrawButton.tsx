import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled, { DefaultTheme, useTheme } from "styled-components";

import { useParams } from "react-router-dom";
import { type TransactionReceipt } from "viem";
import { usePublicClient } from "wagmi";

import { type _TimelineItem1, Button } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import {
  klerosCoreAddress,
  useSimulateKlerosCoreSetStake,
  useWriteKlerosCoreSetStake,
  useSimulatePnkIncreaseAllowance,
  useWritePnkIncreaseAllowance,
} from "hooks/contracts/generated";
import { useCourtDetails } from "hooks/queries/useCourtDetails";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { usePnkData } from "hooks/usePNKData";
import { formatETH } from "utils/format";
import { isUndefined } from "utils/index";
import { parseWagmiError } from "utils/parseWagmiError";
import { refetchWithRetry } from "utils/refecthWithRetry";

import { EnsureChain } from "components/EnsureChain";

import StakeWithdrawPopup from "./StakeWithdrawPopup";
import { getStakeSteps, StakeSteps } from "./StakeWithdrawPopup/stakeSteps";

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

type Steps = [_TimelineItem1, ..._TimelineItem1[]];
interface IActionButton {
  amount: string;
  parsedAmount: bigint;
  action: ActionType;
  setAmount: (arg0: string) => void;
  setErrorMsg: (msg: string) => void;
}

const StakeWithdrawButton: React.FC<IActionButton> = ({ amount, parsedAmount, action, setErrorMsg, setAmount }) => {
  const { id } = useParams();
  const theme = useTheme();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [popupStepsState, setPopupStepsState] = useState<Steps>();
  const controllerRef = useRef<AbortController | null>(null);
  useLockOverlayScroll(isPopupOpen);

  const { data: courtDetails } = useCourtDetails(id);
  const { balance, jurorBalance, allowance, refetchAllowance } = usePnkData({ courtId: id });

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

  const {
    data: increaseAllowanceConfig,
    isLoading: isSimulatingAllowance,
    error: allowanceError,
  } = useSimulatePnkIncreaseAllowance({
    query: {
      enabled:
        isAllowance &&
        !isUndefined(targetStake) &&
        !isUndefined(allowance) &&
        !isUndefined(balance) &&
        parsedAmount <= balance,
    },
    args: [klerosCoreAddress[DEFAULT_CHAIN], BigInt(targetStake ?? 0) - BigInt(allowance ?? 0)],
  });

  const { writeContractAsync: increaseAllowance } = useWritePnkIncreaseAllowance();

  const {
    data: setStakeConfig,
    error: setStakeError,
    isLoading: isSimulatingSetStake,
    refetch: refetchSetStake,
  } = useSimulateKlerosCoreSetStake({
    query: {
      enabled:
        !isUndefined(targetStake) &&
        !isUndefined(id) &&
        parsedAmount !== 0n &&
        targetStake >= 0n &&
        !isAllowance &&
        Boolean(isStaking ? balance && parsedAmount <= balance : jurorBalance && parsedAmount <= jurorBalance[2]),
    },
    args: [BigInt(id ?? 0), targetStake],
  });
  const { writeContractAsync: setStake } = useWriteKlerosCoreSetStake();

  const updatePopupState = (signal: AbortSignal, state: Steps) => {
    if (signal.aborted) return;
    setPopupStepsState(state);
  };

  const handleStake = useCallback(
    (signal: AbortSignal, config?: typeof setStakeConfig, approvalHash?: `0x${string}`) => {
      if (signal.aborted) return;
      const isWithdraw = action === ActionType.withdraw;
      const requestData = config?.request ?? setStakeConfig?.request;
      const commonArgs: [string, DefaultTheme, `0x${string}` | undefined] = [amount, theme, approvalHash];

      if (requestData && publicClient) {
        updatePopupState(
          signal,
          getStakeSteps(isWithdraw ? StakeSteps.WithdrawInitiate : StakeSteps.StakeInitiate, ...commonArgs)
        );

        setStake(requestData)
          .then(async (hash) => {
            if (signal.aborted) return;
            updatePopupState(
              signal,
              getStakeSteps(isWithdraw ? StakeSteps.WithdrawPending : StakeSteps.StakePending, ...commonArgs, hash)
            );
            await publicClient.waitForTransactionReceipt({ hash, confirmations: 2 }).then((res: TransactionReceipt) => {
              if (signal.aborted) return;
              const status = res.status === "success";
              if (status) {
                updatePopupState(
                  signal,
                  getStakeSteps(
                    isWithdraw ? StakeSteps.WithdrawConfirmed : StakeSteps.StakeConfirmed,
                    ...commonArgs,
                    hash
                  )
                );
                setIsSuccess(true);
              } else
                updatePopupState(
                  signal,
                  getStakeSteps(isWithdraw ? StakeSteps.WithdrawFailed : StakeSteps.StakeFailed, ...commonArgs, hash)
                );
            });
          })
          .catch((err) => {
            updatePopupState(
              signal,
              getStakeSteps(
                isWithdraw ? StakeSteps.WithdrawFailed : StakeSteps.StakeFailed,
                ...commonArgs,
                undefined,
                err
              )
            );
          });
      }
    },
    [setStake, setStakeConfig, publicClient, amount, theme, action]
  );

  const handleClick = useCallback(() => {
    setIsPopupOpen(true);
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    if (isAllowance && increaseAllowanceConfig && publicClient) {
      const commonArgs: [string, DefaultTheme] = [amount, theme];
      updatePopupState(signal, getStakeSteps(StakeSteps.ApproveInitiate, ...commonArgs));

      increaseAllowance(increaseAllowanceConfig.request)
        .then(async (hash) => {
          if (signal.aborted) return;
          updatePopupState(signal, getStakeSteps(StakeSteps.ApprovePending, ...commonArgs, hash));

          await publicClient
            .waitForTransactionReceipt({ hash, confirmations: 2 })
            .then(async (res: TransactionReceipt) => {
              if (signal.aborted) return;
              const status = res.status === "success";
              if (status) {
                await refetchAllowance();
                const refetchData = await refetchWithRetry(refetchSetStake);
                // check for a relatively new error with react/tanstack-query:
                // https://github.com/TanStack/query/issues/8209
                if (!refetchData?.data)
                  updatePopupState(
                    signal,
                    getStakeSteps(
                      StakeSteps.ApproveFailed,
                      ...commonArgs,
                      hash,
                      undefined,
                      new Error("Something went wrong. Please restart the process.")
                    )
                  );
                else {
                  handleStake(signal, refetchData.data, hash);
                }
              } else updatePopupState(signal, getStakeSteps(StakeSteps.ApproveFailed, ...commonArgs, hash));
            });
        })
        .catch((err) => {
          updatePopupState(signal, getStakeSteps(StakeSteps.ApproveFailed, ...commonArgs, undefined, undefined, err));
        });
    } else {
      handleStake(signal);
    }
  }, [
    increaseAllowance,
    increaseAllowanceConfig,
    handleStake,
    isAllowance,
    theme,
    publicClient,
    amount,
    refetchAllowance,
    refetchSetStake,
  ]);

  useEffect(() => {
    if (isPopupOpen) return;
    if (
      action === ActionType.stake &&
      targetStake !== 0n &&
      courtDetails &&
      targetStake < BigInt(courtDetails.court?.minStake)
    ) {
      setErrorMsg(`Min Stake in court is: ${formatETH(courtDetails?.court?.minStake)}`);
    } else if (setStakeError || allowanceError) {
      setErrorMsg(parseWagmiError(setStakeError || allowanceError));
    }
  }, [setStakeError, setErrorMsg, targetStake, courtDetails, allowanceError, isPopupOpen, action]);

  const isDisabled = useMemo(() => {
    if (parsedAmount == 0n) return true;
    if (isAllowance) {
      return isUndefined(increaseAllowanceConfig) || isSimulatingAllowance || !isUndefined(allowanceError);
    }
    return isUndefined(setStakeConfig) || isSimulatingSetStake || !isUndefined(setStakeError);
  }, [
    parsedAmount,
    increaseAllowanceConfig,
    isSimulatingAllowance,
    setStakeConfig,
    isSimulatingSetStake,
    setStakeError,
    allowanceError,
    isAllowance,
  ]);

  const closePopup = () => {
    setIsPopupOpen(false);
    setIsSuccess(false);
    setAmount("");
    setPopupStepsState(undefined);
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  };

  return (
    <EnsureChain>
      <Container>
        <Button
          text={isStaking ? "Stake" : "Withdraw"}
          isLoading={isPopupOpen || isSimulatingAllowance || isSimulatingSetStake}
          disabled={isDisabled || isSimulatingAllowance || isSimulatingSetStake}
          onClick={handleClick}
        />
        {isPopupOpen && <StakeWithdrawPopup {...{ action, closePopup, amount, steps: popupStepsState, isSuccess }} />}
      </Container>
    </EnsureChain>
  );
};

export default StakeWithdrawButton;
