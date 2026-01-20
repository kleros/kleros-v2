import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";

import { useTranslation } from "react-i18next";
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
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { usePnkData } from "hooks/usePNKData";
import { isUndefined } from "utils/index";
import { parseWagmiError } from "utils/parseWagmiError";
import { refetchWithRetry } from "utils/refecthWithRetry";

import { useCourtDetails } from "queries/useCourtDetails";

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
  setErrorMsg: (msg?: string) => void;
  isPopupOpen: boolean;
  setIsPopupOpen: (arg0: boolean) => void;
}

const StakeWithdrawButton: React.FC<IActionButton> = ({
  amount,
  parsedAmount,
  action,
  setErrorMsg,
  setAmount,
  isPopupOpen,
  setIsPopupOpen,
}) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const theme = useTheme();
  const [isSuccess, setIsSuccess] = useState(false);
  const [popupStepsState, setPopupStepsState] = useState<Steps>();
  const controllerRef = useRef<AbortController | null>(null);
  useLockOverlayScroll(isPopupOpen);

  const { balance, jurorBalance, allowance, refetchAllowance } = usePnkData({ courtId: id });
  const { data: courtDetails } = useCourtDetails(id);
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

      if (requestData && publicClient) {
        updatePopupState(
          signal,
          getStakeSteps(
            isWithdraw ? StakeSteps.WithdrawInitiate : StakeSteps.StakeInitiate,
            amount,
            theme,
            approvalHash,
            undefined,
            undefined,
            t
          )
        );

        setStake(requestData)
          .then(async (hash) => {
            if (signal.aborted) return;
            updatePopupState(
              signal,
              getStakeSteps(
                isWithdraw ? StakeSteps.WithdrawPending : StakeSteps.StakePending,
                amount,
                theme,
                approvalHash,
                hash,
                undefined,
                t
              )
            );
            await publicClient.waitForTransactionReceipt({ hash, confirmations: 2 }).then((res: TransactionReceipt) => {
              if (signal.aborted) return;
              const status = res.status === "success";
              if (status) {
                updatePopupState(
                  signal,
                  getStakeSteps(
                    isWithdraw ? StakeSteps.WithdrawConfirmed : StakeSteps.StakeConfirmed,
                    amount,
                    theme,
                    approvalHash,
                    hash,
                    undefined,
                    t
                  )
                );
                setIsSuccess(true);
              } else
                updatePopupState(
                  signal,
                  getStakeSteps(
                    isWithdraw ? StakeSteps.WithdrawFailed : StakeSteps.StakeFailed,
                    amount,
                    theme,
                    approvalHash,
                    hash,
                    undefined,
                    t
                  )
                );
            });
          })
          .catch((err) => {
            updatePopupState(
              signal,
              getStakeSteps(
                isWithdraw ? StakeSteps.WithdrawFailed : StakeSteps.StakeFailed,
                amount,
                theme,
                approvalHash,
                undefined,
                err,
                t
              )
            );
          });
      } else {
        updatePopupState(
          signal,
          getStakeSteps(
            StakeSteps.StakeFailed,
            amount,
            theme,
            approvalHash,
            undefined,
            new Error("Simulation Failed. Please restart the process."),
            t
          )
        );
      }
    },
    [setStake, setStakeConfig, publicClient, amount, theme, action, t]
  );

  const handleClick = useCallback(() => {
    setIsPopupOpen(true);
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    if (isAllowance && increaseAllowanceConfig && publicClient) {
      updatePopupState(
        signal,
        getStakeSteps(StakeSteps.ApproveInitiate, amount, theme, undefined, undefined, undefined, t)
      );

      increaseAllowance(increaseAllowanceConfig.request)
        .then(async (hash) => {
          if (signal.aborted) return;
          updatePopupState(
            signal,
            getStakeSteps(StakeSteps.ApprovePending, amount, theme, hash, undefined, undefined, t)
          );

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
                      amount,
                      theme,
                      hash,
                      undefined,
                      new Error("Something went wrong. Please restart the process."),
                      t
                    )
                  );
                else {
                  handleStake(signal, refetchData.data, hash);
                }
              } else
                updatePopupState(
                  signal,
                  getStakeSteps(StakeSteps.ApproveFailed, amount, theme, hash, undefined, undefined, t)
                );
            });
        })
        .catch((err) => {
          updatePopupState(
            signal,
            getStakeSteps(StakeSteps.ApproveFailed, amount, theme, undefined, undefined, err, t)
          );
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
    setIsPopupOpen,
    t,
  ]);

  useEffect(() => {
    if (isPopupOpen) return;
    if (setStakeError || allowanceError) {
      setErrorMsg(parseWagmiError(setStakeError || allowanceError));
    }
  }, [setStakeError, setErrorMsg, targetStake, allowanceError, isPopupOpen]);

  const isDisabled = useMemo(() => {
    if (
      parsedAmount == 0n ||
      (action === ActionType.stake &&
        courtDetails &&
        jurorBalance &&
        parsedAmount !== 0n &&
        jurorBalance[2] + parsedAmount < BigInt(courtDetails?.court?.minStake))
    )
      return true;
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
    action,
    courtDetails,
    jurorBalance,
  ]);

  const closePopup = () => {
    setErrorMsg(undefined);
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
          text={isStaking ? t("buttons.stake") : t("buttons.withdraw")}
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
