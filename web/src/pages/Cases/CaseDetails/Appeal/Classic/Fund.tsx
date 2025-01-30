import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useDebounce } from "react-use";
import { useAccount, useBalance, usePublicClient } from "wagmi";

import { Field, Button } from "@kleros/ui-components-library";

import { REFETCH_INTERVAL } from "consts/index";
import { useSimulateDisputeKitClassicFundAppeal, useWriteDisputeKitClassicFundAppeal } from "hooks/contracts/generated";
import { useSelectedOptionContext, useFundingContext, useCountdownContext } from "hooks/useClassicAppealContext";
import { useParsedAmount } from "hooks/useParsedAmount";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";

import { EnsureChain } from "components/EnsureChain";
import { ErrorButtonMessage } from "components/ErrorButtonMessage";
import ClosedCircleIcon from "components/StyledIcons/ClosedCircleIcon";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StyledField = styled(Field)`
  width: 100%;
  & > input {
    text-align: center;
  }
  &:before {
    position: absolute;
    content: "ETH";
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.primaryText};
  }
`;

const StyledButton = styled(Button)`
  margin: auto;
  margin-top: 4px;
`;

const StyledLabel = styled.label`
  align-self: flex-start;
`;

const useNeedFund = () => {
  const { loserSideCountdown } = useCountdownContext();
  const { fundedChoices, winningChoice } = useFundingContext();
  const needFund =
    (loserSideCountdown ?? 0) > 0 ||
    (!isUndefined(fundedChoices) &&
      !isUndefined(winningChoice) &&
      fundedChoices.length > 0 &&
      !fundedChoices.includes(winningChoice));

  return needFund;
};

const useFundAppeal = (parsedAmount, insufficientBalance) => {
  const { id } = useParams();
  const { selectedOption } = useSelectedOptionContext();
  const {
    data: fundAppealConfig,
    isLoading,
    isError,
  } = useSimulateDisputeKitClassicFundAppeal({
    query: {
      enabled: !isUndefined(id) && !isUndefined(selectedOption) && !insufficientBalance,
    },
    args: [BigInt(id ?? 0), BigInt(selectedOption?.id ?? 0)],
    value: parsedAmount,
  });

  const { writeContractAsync: fundAppeal } = useWriteDisputeKitClassicFundAppeal();

  return { fundAppeal, fundAppealConfig, isLoading, isError };
};

interface IFund {
  amount: `${number}`;
  setAmount: (val: string) => void;
  setIsOpen: (val: boolean) => void;
}

const Fund: React.FC<IFund> = ({ amount, setAmount, setIsOpen }) => {
  const needFund = useNeedFund();
  const { address, isDisconnected } = useAccount();
  const { data: balance } = useBalance({
    query: {
      refetchInterval: REFETCH_INTERVAL,
    },
    address,
  });
  const publicClient = usePublicClient();

  const [isSending, setIsSending] = useState(false);
  const [debouncedAmount, setDebouncedAmount] = useState<`${number}` | "">("");
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);

  const parsedAmount = useParsedAmount(debouncedAmount as `${number}`);

  const insufficientBalance = useMemo(() => {
    return balance && balance.value < parsedAmount;
  }, [balance, parsedAmount]);

  const { fundAppealConfig, fundAppeal, isLoading, isError } = useFundAppeal(parsedAmount, insufficientBalance);

  const isFundDisabled = useMemo(
    () =>
      isDisconnected ||
      isSending ||
      !balance ||
      insufficientBalance ||
      Number(parsedAmount) <= 0 ||
      isError ||
      isLoading,
    [isDisconnected, isSending, balance, insufficientBalance, parsedAmount, isError, isLoading]
  );

  return needFund ? (
    <Container>
      <StyledLabel>How much ETH do you want to contribute?</StyledLabel>
      <StyledField
        type="number"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
        }}
        placeholder="Amount to fund"
      />
      <EnsureChain>
        <div>
          <StyledButton
            disabled={isFundDisabled}
            isLoading={(isSending || isLoading) && !insufficientBalance}
            text={isDisconnected ? "Connect to Fund" : "Fund"}
            onClick={() => {
              if (fundAppeal && fundAppealConfig && publicClient) {
                setIsSending(true);
                wrapWithToast(async () => await fundAppeal(fundAppealConfig.request), publicClient)
                  .then((res) => setIsOpen(res.status))
                  .finally(() => {
                    setIsSending(false);
                  });
              }
            }}
          />
          {insufficientBalance && (
            <ErrorButtonMessage>
              <ClosedCircleIcon /> Insufficient balance
            </ErrorButtonMessage>
          )}
        </div>
      </EnsureChain>
    </Container>
  ) : null;
};

export default Fund;
