import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccount, useBalance } from "wagmi";
import { useDebounce } from "react-use";
import { Field, Button } from "@kleros/ui-components-library";
import { usePrepareDisputeKitClassicFundAppeal, useDisputeKitClassicFundAppeal } from "hooks/contracts/generated";
import { wrapWithToast } from "utils/wrapWithToast";
import { useParsedAmount } from "hooks/useParsedAmount";
import {
  useLoserSideCountdownContext,
  useSelectedOptionContext,
  useFundingContext,
} from "hooks/useClassicAppealContext";
import { isUndefined } from "utils/index";

const Fund: React.FC = () => {
  const loserSideCountdown = useLoserSideCountdownContext();
  const { fundedChoices, winningChoice } = useFundingContext();
  const needFund =
    loserSideCountdown! > 0 ||
    (!isUndefined(fundedChoices) &&
      !isUndefined(winningChoice) &&
      fundedChoices.length > 0 &&
      !fundedChoices.includes(winningChoice));
  const { id } = useParams();
  const { address, isDisconnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    watch: true,
  });
  const [amount, setAmount] = useState("");
  const [debouncedAmount, setDebouncedAmount] = useState("");
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);
  const parsedAmount = useParsedAmount(debouncedAmount);
  const [isSending, setIsSending] = useState(false);
  const { selectedOption } = useSelectedOptionContext();
  const { config: fundAppealConfig } = usePrepareDisputeKitClassicFundAppeal({
    enabled: !isUndefined(id) && !isUndefined(selectedOption),
    args: [BigInt(id ?? 0), BigInt(selectedOption ?? 0)],
    value: parsedAmount,
  });
  const { writeAsync: fundAppeal } = useDisputeKitClassicFundAppeal(fundAppealConfig);
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
        <StyledButton
          disabled={isDisconnected || isSending || !balance || parsedAmount > balance.value}
          text={isDisconnected ? "Connect to Fund" : "Fund"}
          onClick={() => {
            if (fundAppeal) {
              setIsSending(true);
              wrapWithToast(fundAppeal!())
                .then(() => {
                  setAmount("");
                  close();
                })
                .finally(() => setIsSending(false));
            }
          }}
        />
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
