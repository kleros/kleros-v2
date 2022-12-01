import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import Modal from "react-modal";
import { utils } from "ethers";
import { Field, Button } from "@kleros/ui-components-library";
import { KlerosCore } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/KlerosCore";
import { useWeb3 } from "hooks/useWeb3";
import { useConnectedContract } from "hooks/useConnectedContract";
import { usePNKBalance } from "queries/usePNKBalance";
import { usePNKAllowance } from "queries/usePNKAllowance";

const StakeModal: React.FC<{ isOpen: boolean; close: () => void }> = ({
  isOpen,
  close,
}) => {
  const { id } = useParams();
  const klerosCore = useConnectedContract("KlerosCore") as KlerosCore;
  const [isSending, setIsSending] = useState(false);
  const [amount, setAmount] = useState("");
  const { account } = useWeb3();
  const { data: balance } = usePNKBalance(account);
  console.log(balance);
  const { data: allowance } = usePNKAllowance(account);
  return (
    <StyledModal {...{ isOpen }}>
      <h1>Submit New Evidence</h1>
      <Field
        type="number"
        value={amount}
        onChange={(e) => {
          const newValue = e.target.value;
          console.log(
            "newValue",
            newValue,
            newValue.match(/^\d+(\.\d*){0,1}$/)
          );
          if (newValue.match(/^[\d]+([.]\d*)?$/)) {
            setAmount(newValue);
          }
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
        <Button
          text="Stake"
          isLoading={isSending}
          disabled={isSending}
          onClick={() => {
            if (typeof id !== "undefined" && amount !== "") {
              setIsSending(true);
              klerosCore
                .setStake(utils.parseUnits(amount, 18), id)
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
      </ButtonArea>
    </StyledModal>
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
