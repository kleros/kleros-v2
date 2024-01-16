import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccount, useBalance, usePublicClient } from "wagmi";
import { useDebounce } from "react-use";
import { Field, Button } from "@kleros/ui-components-library";
import { wrapWithToast } from "utils/wrapWithToast";
import { isUndefined } from "utils/index";
import { EnsureChain } from "components/EnsureChain";
import { useSimulateDisputeKitClassicFundAppeal, useWriteDisputeKitClassicFundAppeal } from "hooks/contracts/generated";
import { useParsedAmount } from "hooks/useParsedAmount";
import {
  useLoserSideCountdownContext,
  useSelectedOptionContext,
  useFundingContext,
} from "hooks/useClassicAppealContext";

const Container = styled.div`
  display: flex;
  flex-direction: column;
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
  margin-top: 12px;
`;

const useNeedFund = () => {
  const loserSideCountdown = useLoserSideCountdownContext();
  const { fundedChoices, winningChoice } = useFundingContext();
  const needFund =
    (loserSideCountdown ?? 0) > 0 ||
    (!isUndefined(fundedChoices) &&
      !isUndefined(winningChoice) &&
      fundedChoices.length > 0 &&
      !fundedChoices.includes(winningChoice));

  return needFund;
};

interface IFund {
  amount: `${number}`;
  setAmount: (val: string) => void;
  setIsOpen: (val: boolean) => void;
}

const Fund: React.FC<IFund> = ({ amount, setAmount, setIsOpen }) => {
  const needFund = useNeedFund();
  const { address, isDisconnected } = useAccount();
  // TODO refetch on block
  const { data: balance } = useBalance({
    address,
  });
  const publicClient = usePublicClient();

  const [isSending, setIsSending] = useState(false);
  const [debouncedAmount, setDebouncedAmount] = useState<`${number}` | "">("");
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);

  const parsedAmount = useParsedAmount(debouncedAmount as `${number}`);

  const { id } = useParams();
  const { selectedOption } = useSelectedOptionContext();
  const { data: fundAppealConfig } = useSimulateDisputeKitClassicFundAppeal({
    query: {
      enabled: !isUndefined(id) && !isUndefined(selectedOption),
    },
    args: [BigInt(id ?? 0), BigInt(selectedOption ?? 0)],
    value: parsedAmount,
  });

  const { writeContractAsync: fundAppeal } = useWriteDisputeKitClassicFundAppeal();

  return needFund ? (
    <Container>
      <label>How much ETH do you want to contribute?</label>
      <div>
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
            disabled={isDisconnected || isSending || !balance || parsedAmount > balance.value}
            text={isDisconnected ? "Connect to Fund" : "Fund"}
            onClick={() => {
              if (fundAppealConfig) {
                setIsSending(true);
                wrapWithToast(async () => await fundAppeal(fundAppealConfig.request), publicClient)
                  .then(() => {
                    setIsOpen(true);
                  })
                  .finally(() => {
                    setIsSending(false);
                  });
              }
            }}
          />
        </EnsureChain>
      </div>
    </Container>
  ) : (
    <></>
  );
};

export default Fund;
