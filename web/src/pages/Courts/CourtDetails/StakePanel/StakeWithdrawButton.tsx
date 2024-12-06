import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";

import { useParams } from "react-router-dom";
import { type TransactionReceipt } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { type _TimelineItem1, Button } from "@kleros/ui-components-library";

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
import { formatETH } from "utils/format";
import { isUndefined } from "utils/index";
import { parseWagmiError } from "utils/parseWagmiError";

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

interface IActionButton {
  amount: string;
  parsedAmount: bigint;
  action: ActionType;
  setAmount: (arg0: string) => void;
  setErrorMsg: (msg: string) => void;
}

const StakeWithdrawButton: React.FC<IActionButton> = ({ amount, parsedAmount, action, setErrorMsg, setAmount }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const theme = useTheme();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [popupStepsState, setPopupStepsState] = useState<{
    items: [_TimelineItem1, ..._TimelineItem1[]];
    current: number;
  }>();

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
  const { data: allowance, refetch: refetchAllowance } = useReadPnkAllowance({
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

  const {
    data: increaseAllowanceConfig,
    isLoading: isSimulatingAllowance,
    error: allowanceError,
  } = useSimulatePnkIncreaseAllowance({
    query: {
      enabled:
        isAllowance && !isUndefined(targetStake) && !isUndefined(allowance) && !isUndefined(balance) && !isPopupOpen,
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
        (isStaking ? true : jurorBalance && parsedAmount <= jurorBalance[2]),
    },
    args: [BigInt(id ?? 0), targetStake],
  });
  const { writeContractAsync: setStake } = useWriteKlerosCoreSetStake();

  const handleStake = useCallback(
    (config?: typeof setStakeConfig, approvalHash?: `0x${string}`) => {
      const isWithdraw = action === ActionType.withdraw;
      const requestData = config?.request ?? setStakeConfig?.request;

      if (requestData && publicClient) {
        setPopupStepsState({
          items: getStakeSteps(
            isWithdraw ? StakeSteps.WithdrawInitiate : StakeSteps.StakeInitiate,
            amount,
            theme,
            approvalHash
          ),
          current: 1,
        });

        setStake(requestData)
          .then(async (hash) => {
            setPopupStepsState({
              items: getStakeSteps(
                isWithdraw ? StakeSteps.WithdrawPending : StakeSteps.StakePending,
                amount,
                theme,
                approvalHash,
                hash
              ),
              current: 1,
            });
            await publicClient.waitForTransactionReceipt({ hash, confirmations: 2 }).then((res: TransactionReceipt) => {
              const status = res.status === "success";
              if (status) {
                setPopupStepsState({
                  items: getStakeSteps(
                    isWithdraw ? StakeSteps.WithdrawConfirmed : StakeSteps.StakeConfirmed,
                    amount,
                    theme,
                    approvalHash,
                    hash
                  ),
                  current: 1,
                });
                setIsSuccess(true);
              } else
                setPopupStepsState({
                  items: getStakeSteps(
                    isWithdraw ? StakeSteps.WithdrawFailed : StakeSteps.StakeFailed,
                    amount,
                    theme,
                    approvalHash,
                    hash
                  ),
                  current: 1,
                });
            });
          })
          .catch((err) => {
            setPopupStepsState({
              items: getStakeSteps(
                isWithdraw ? StakeSteps.WithdrawFailed : StakeSteps.StakeFailed,
                amount,
                theme,
                approvalHash,
                undefined,
                err
              ),
              current: 1,
            });
          });
      }
    },
    [setStake, setStakeConfig, publicClient, amount, theme, action]
  );

  const handleClick = useCallback(() => {
    setIsPopupOpen(true);
    if (ActionType.allowance && isAllowance && increaseAllowanceConfig && publicClient) {
      setPopupStepsState({
        items: getStakeSteps(StakeSteps.ApproveInitiate, amount, theme),
        current: 0,
      });

      increaseAllowance(increaseAllowanceConfig.request)
        .then(async (hash) => {
          setPopupStepsState({
            items: getStakeSteps(StakeSteps.ApprovePending, amount, theme, hash),
            current: 0,
          });

          await publicClient
            .waitForTransactionReceipt({ hash, confirmations: 2 })
            .then(async (res: TransactionReceipt) => {
              const status = res.status === "success";
              if (status) {
                await refetchAllowance();
                const refetchData = await refetchSetStake();

                handleStake(refetchData.data, hash);
              } else
                setPopupStepsState({
                  items: getStakeSteps(StakeSteps.ApproveFailed, amount, theme, hash),
                  current: 0,
                });
            });
        })
        .catch((err) => {
          setPopupStepsState({
            items: getStakeSteps(StakeSteps.ApproveFailed, amount, theme, undefined, undefined, err),
            current: 0,
          });
        });
    } else {
      handleStake();
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
    if (setStakeError || allowanceError) {
      setErrorMsg(parseWagmiError(setStakeError || allowanceError));
    } else if (targetStake !== 0n && courtDetails && targetStake < BigInt(courtDetails.court?.minStake)) {
      setErrorMsg(`Min Stake in court is: ${formatETH(courtDetails?.court?.minStake)}`);
    }
  }, [setStakeError, setErrorMsg, targetStake, courtDetails, allowanceError]);

  const isDisabled = useMemo(() => {
    if (
      parsedAmount == 0n ||
      isUndefined(targetStake) ||
      isUndefined(courtDetails) ||
      (targetStake !== 0n && targetStake < BigInt(courtDetails.court?.minStake))
    )
      return true;
    if (isAllowance) {
      return isUndefined(increaseAllowanceConfig) || isSimulatingAllowance || !isUndefined(allowanceError);
    }

    return isUndefined(setStakeConfig) || isSimulatingSetStake || !isUndefined(setStakeError);
  }, [
    parsedAmount,
    targetStake,
    courtDetails,
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
