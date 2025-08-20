import React, { useMemo } from "react";
import styled from "styled-components";

import { useNavigate } from "react-router-dom";
import { useAccount, useBalance, usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import { MIN_DISPUTE_BATCH_SIZE, useNewDisputeContext } from "context/NewDisputeContext";
import { disputeResolverAbi, disputeResolverAddress } from "hooks/contracts/generated";
import useTransactionBatcher from "hooks/useTransactionBatcher";
import { isUndefined } from "utils/index";
import { parseWagmiError } from "utils/parseWagmiError";
import { prepareArbitratorExtradata } from "utils/prepareArbitratorExtradata";
import { wrapWithToast } from "utils/wrapWithToast";

import { EnsureChain } from "components/EnsureChain";
import { ErrorButtonMessage } from "components/ErrorButtonMessage";
import ClosedCircleIcon from "components/StyledIcons/ClosedCircleIcon";

import { isTemplateValid } from "./SubmitDisputeButton";

const StyledButton = styled(Button)``;

const SubmitBatchDisputesButton: React.FC = () => {
  const publicClient = usePublicClient();
  const navigate = useNavigate();
  const { disputeTemplate, disputeData, resetDisputeData, isSubmittingCase, setIsSubmittingCase, batchSize } =
    useNewDisputeContext();

  const { address, chainId } = useAccount();
  const { data: userBalance, isLoading: isBalanceLoading } = useBalance({ address });

  const insufficientBalance = useMemo(() => {
    const arbitrationCost = disputeData.arbitrationCost ? BigInt(disputeData.arbitrationCost) : BigInt(0);
    return userBalance && userBalance.value < arbitrationCost * BigInt(batchSize ?? MIN_DISPUTE_BATCH_SIZE);
  }, [userBalance, disputeData, batchSize]);

  const {
    executeBatch,
    batchConfig,
    isLoading: isLoadingConfig,
    error,
    isError,
  } = useTransactionBatcher(
    Array.from({ length: batchSize }, () => ({
      abi: disputeResolverAbi,
      address: disputeResolverAddress[chainId ?? DEFAULT_CHAIN],
      functionName: "createDisputeForTemplate",
      args: [
        prepareArbitratorExtradata(
          disputeData.courtId ?? "1",
          disputeData.numberOfJurors ?? 3,
          disputeData.disputeKitId ?? 1,
          disputeData.disputeKitData
        ),
        JSON.stringify(disputeTemplate),
        "",
        BigInt(disputeTemplate.answers.length),
      ],
      value: BigInt(disputeData.arbitrationCost ?? 0),
    })),
    {
      enabled: !insufficientBalance && isTemplateValid(disputeTemplate),
    }
  );

  const isButtonDisabled = useMemo(
    () =>
      isError ||
      isSubmittingCase ||
      !isTemplateValid(disputeTemplate) ||
      isBalanceLoading ||
      insufficientBalance ||
      isLoadingConfig,
    [isSubmittingCase, insufficientBalance, isBalanceLoading, disputeTemplate, isLoadingConfig, isError]
  );

  const errorMsg = useMemo(() => {
    if (insufficientBalance) return "Insufficient balance";
    else if (error) {
      return parseWagmiError(error);
    }
    return null;
  }, [error, insufficientBalance]);

  return (
    <EnsureChain>
      <div>
        <StyledButton
          text="Create cases"
          disabled={isButtonDisabled}
          isLoading={(isSubmittingCase || isBalanceLoading || isLoadingConfig) && !insufficientBalance}
          onClick={() => {
            if (batchConfig && publicClient) {
              setIsSubmittingCase(true);
              wrapWithToast(async () => await executeBatch(batchConfig), publicClient)
                .then((res) => {
                  if (res.status && !isUndefined(res.result)) {
                    resetDisputeData();
                    navigate("/cases/display/1/desc/all");
                  }
                })
                .finally(() => {
                  setIsSubmittingCase(false);
                });
            }
          }}
        />
        {errorMsg && (
          <ErrorButtonMessage>
            <ClosedCircleIcon /> {errorMsg}
          </ErrorButtonMessage>
        )}
      </div>
    </EnsureChain>
  );
};

export default SubmitBatchDisputesButton;
