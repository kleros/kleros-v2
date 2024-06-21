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
    right: 12px;
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

const useFundAppeal = (parsedAmount) => {
  const { id } = useParams();
  const { selectedOption } = useSelectedOptionContext();
  const { data: fundAppealConfig, isError } = useSimulateDisputeKitClassicFundAppeal({
    query: {
      enabled: !isUndefined(id) && !isUndefined(selectedOption),
    },
    args: [BigInt(id ?? 0), BigInt(selectedOption ?? 0)],
    value: parsedAmount,
  });

  const { writeContractAsync } = useWriteDisputeKitClassicFundAppeal();

  return { fundAppeal: async () => await writeContractAsync(fundAppealConfig.request), isError };
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

  const { fundAppeal, isError } = useFundAppeal(parsedAmount);

  const isFundDisabled = useMemo(
    () =>
      isDisconnected || isSending || !balance || parsedAmount > balance.value || Number(parsedAmount) <= 0 || isError,
    [isDisconnected, isSending, balance, parsedAmount, isError]
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
        <StyledButton
          disabled={isFundDisabled}
          isLoading={isSending}
          text={isDisconnected ? "Connect to Fund" : "Fund"}
          onClick={() => {
            if (fundAppeal) {
              setIsSending(true);
              wrapWithToast(async () => await fundAppeal().then((response) => response.hash), publicClient)
                .then((res) => {
                  res.status && setIsOpen(true);
                })
                .finally(() => {
                  setIsSending(false);
                });
            }
          }}
        />
      </EnsureChain>
    </Container>
  ) : (
    <></>
  );
};

export default Fund;
