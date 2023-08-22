import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccount, useBalance, usePublicClient } from "wagmi";
import { useDebounce } from "react-use";
import { Field, Button } from "@kleros/ui-components-library";
import { wrapWithToast } from "utils/wrapWithToast";
import { isUndefined } from "utils/index";
import { EnsureChain } from "components/EnsureChain";
import { usePrepareDisputeKitClassicFundAppeal, useDisputeKitClassicFundAppeal } from "hooks/contracts/generated";
import { useParsedAmount } from "hooks/useParsedAmount";
import {
  useLoserSideCountdownContext,
  useSelectedOptionContext,
  useFundingContext,
} from "hooks/useClassicAppealContext";

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

const useFundAppeal = (parsedAmount) => {
  const { id } = useParams();
  const { selectedOption } = useSelectedOptionContext();
  const { config: fundAppealConfig } = usePrepareDisputeKitClassicFundAppeal({
    enabled: !isUndefined(id) && !isUndefined(selectedOption),
    args: [BigInt(id ?? 0), BigInt(selectedOption ?? 0)],
    value: parsedAmount,
  });

  const { writeAsync: fundAppeal } = useDisputeKitClassicFundAppeal(fundAppealConfig);

  return fundAppeal;
};

interface IFund {
  amount: string;
  setAmount: (val: string) => void;
  setIsOpen: (val: boolean) => void;
}

const Fund: React.FC<IFund> = ({ amount, setAmount, setIsOpen }) => {
  const needFund = useNeedFund();
  const { address, isDisconnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    watch: true,
  });
  const publicClient = usePublicClient();

  const [debouncedAmount, setDebouncedAmount] = useState("");
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);

  const parsedAmount = useParsedAmount(debouncedAmount);

  const [isSending, setIsSending] = useState(false);
  const fundAppeal = useFundAppeal(parsedAmount);

  return needFund ? (
    <div>
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
              if (fundAppeal) {
                setIsSending(true);
                wrapWithToast(async () => fundAppeal().then((response) => response.hash), publicClient)
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
    </div>
  ) : (
    <></>
  );
};

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

export default Fund;
