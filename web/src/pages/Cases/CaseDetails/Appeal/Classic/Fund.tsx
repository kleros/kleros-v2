import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccount, useBalance } from "wagmi";
import { Field, Button } from "@kleros/ui-components-library";
import { DisputeKitClassic } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/dispute-kits/DisputeKitClassic";
import { useConnectedContract } from "hooks/useConnectedContract";
import { wrapWithToast } from "utils/wrapWithToast";
import { useParsedAmount } from "hooks/useParsedAmount";
import {
  useLoserSideCountdownContext,
  useSelectedOptionContext,
  useFundingContext,
} from "hooks/useClassicAppealContext";
import { notUndefined } from "utils/index";

const Fund: React.FC = () => {
  const loserSideCountdown = useLoserSideCountdownContext();
  const { fundedChoices, winningChoice } = useFundingContext();
  const needFund =
    notUndefined([loserSideCountdown, fundedChoices]) &&
    (loserSideCountdown! > 0 ||
      (fundedChoices!.length > 0 && !fundedChoices?.includes(winningChoice!)));
  const { id } = useParams();
  const { address, isDisconnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    watch: true,
    cacheTime: 12_000,
  });
  const [amount, setAmount] = useState("");
  const parsedAmount = useParsedAmount(amount);
  const [isSending, setIsSending] = useState(false);
  const disputeKitClassic = useConnectedContract(
    "DisputeKitClassic"
  ) as DisputeKitClassic;
  const { selectedOption } = useSelectedOptionContext();
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
          disabled={
            isDisconnected ||
            isSending ||
            !balance ||
            parsedAmount.gt(balance.value)
          }
          text={typeof balance === "undefined" ? "Connect to Fund" : "Fund"}
          onClick={() => {
            if (
              typeof selectedOption !== "undefined" &&
              typeof id !== "undefined"
            ) {
              setIsSending(true);
              wrapWithToast(
                disputeKitClassic.fundAppeal(id, selectedOption, {
                  value: parsedAmount,
                })
              )
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
