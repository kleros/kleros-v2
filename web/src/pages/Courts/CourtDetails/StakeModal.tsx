import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import Modal from "react-modal";
import { BigNumber } from "ethers";
import { Field, Button } from "@kleros/ui-components-library";
import { PNK } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/mock/PNK";
import { KlerosCore } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/KlerosCore";
import { useWeb3 } from "hooks/useWeb3";
import { useConnectedContract } from "hooks/useConnectedContract";
import { useParsedAmount } from "hooks/useParsedAmount";
import { usePNKBalance } from "queries/usePNKBalance";
import { usePNKAllowance } from "queries/usePNKAllowance";

const StakeModal: React.FC<{ isOpen: boolean; close: () => void }> = ({
  isOpen,
  close,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [amount, setAmount] = useState("");
  const parsedAmount = useParsedAmount(amount);
  const { account } = useWeb3();
  const { data: allowance } = usePNKAllowance(account);
  return (
    <StyledModal {...{ isOpen }}>
      <h1>Submit New Evidence</h1>
      <Field
        type="number"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
        }}
        placeholder="Amount to stake"
      />
      <ButtonArea>
        <Button
          variant="secondary"
          disabled={isSending}
          text="Return"
          onClick={close}
        />
        {allowance && allowance.lt(parsedAmount) ? (
          <AllowanceButton {...{ parsedAmount, isSending, setIsSending }} />
        ) : (
          <StakeButton
            {...{ parsedAmount, setAmount, isSending, setIsSending, close }}
          />
        )}
      </ButtonArea>
    </StyledModal>
  );
};

interface IAllowanceButton {
  parsedAmount: BigNumber;
  isSending: boolean;
  setIsSending: (arg0: boolean) => void;
}

const AllowanceButton: React.FC<IAllowanceButton> = ({
  parsedAmount,
  isSending,
  setIsSending,
}) => {
  const { id } = useParams();
  const { account } = useWeb3();
  const { data: allowance } = usePNKAllowance(account);
  const { data: balance } = usePNKBalance(account);
  const klerosCore = useConnectedContract("KlerosCore") as KlerosCore;
  const pnk = useConnectedContract("PNK") as PNK;
  return (
    <Button
      text={"Allow PNK"}
      isLoading={isSending}
      disabled={
        !balance ||
        isSending ||
        parsedAmount.eq(BigNumber.from(0)) ||
        parsedAmount.gt(balance)
      }
      onClick={() => {
        setIsSending(true);
        pnk
          .increaseAllowance(klerosCore.address, parsedAmount.sub(allowance!))
          .then(
            async (tx) =>
              await tx.wait().then(() => {
                console.log("nice!");
              })
          )
          .catch()
          .finally(() => setIsSending(false));
      }}
    />
  );
};

interface IStakeButton extends IAllowanceButton {
  setAmount: (arg0: string) => void;
  close: () => void;
}

const StakeButton: React.FC<IStakeButton> = ({
  parsedAmount,
  setAmount,
  isSending,
  setIsSending,
  close,
}) => {
  const { id } = useParams();
  const klerosCore = useConnectedContract("KlerosCore") as KlerosCore;
  return (
    <Button
      text={"Stake"}
      isLoading={isSending}
      disabled={isSending || parsedAmount.lte(BigNumber.from(0))}
      onClick={() => {
        if (typeof id !== "undefined") {
          setIsSending(true);
          klerosCore
            .setStake(id, parsedAmount)
            .then(
              async (tx) =>
                await tx.wait().then(() => {
                  setAmount("");
                  close();
                })
            )
            .catch()
            .finally(() => setIsSending(false));
        }
      }}
    />
  );
};

const StyledModal = styled(Modal)`
  position: absolute;
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  height: auto;
  width: 80%;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.whiteBackground};

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 16px;
`;

const ButtonArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

export default StakeModal;
