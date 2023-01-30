import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { Field, Button } from "@kleros/ui-components-library";
import { DisputeKitClassic } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/dispute-kits/DisputeKitClassic";
import { useConnectedContract } from "hooks/useConnectedContract";
import { wrapWithToast } from "utils/wrapWithToast";
import { useParsedAmount } from "hooks/useParsedAmount";
import { useETHBalance } from "hooks/queries/useETHBalance";

interface IFund {
  selectedOption?: number;
}

const Fund: React.FC<IFund> = ({ selectedOption }) => {
  const { id } = useParams();
  const { data: balance } = useETHBalance();
  const [amount, setAmount] = useState("");
  const parsedAmount = useParsedAmount(amount);
  const [isSending, setIsSending] = useState(false);
  const disputeKitClassic = useConnectedContract(
    "DisputeKitClassic"
  ) as DisputeKitClassic;
  return (
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
          disabled={isSending || !balance || parsedAmount.gt(balance)}
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
