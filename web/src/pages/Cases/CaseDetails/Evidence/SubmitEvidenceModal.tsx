import React, { useState } from "react";
import styled from "styled-components";
import Modal from "react-modal";
import { Textarea, Button } from "@kleros/ui-components-library";
import { DisputeKitClassic } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/dispute-kits/DisputeKitClassic";
import { useConnectedContract } from "hooks/useConnectedContract";

const SubmitEvidenceModal: React.FC<{
  isOpen: boolean;
  evidenceGroup: string;
  close: () => void;
}> = ({ isOpen, evidenceGroup, close }) => {
  const disputeKit = useConnectedContract(
    "DisputeKitClassic"
  ) as DisputeKitClassic;
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <StyledModal {...{ isOpen }}>
      <h1>Submit New Evidence</h1>
      <StyledTextArea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your Arguments"
      />
      <ButtonArea>
        <Button
          variant="secondary"
          disabled={isSending}
          text="Return"
          onClick={close}
        />
        <Button
          text="Submit"
          isLoading={isSending}
          disabled={isSending}
          onClick={() => {
            setIsSending(true);
            disputeKit
              .submitEvidence(evidenceGroup, message)
              .then(
                async (tx) =>
                  await tx.wait().then(() => {
                    setMessage("");
                    close();
                  })
              )
              .catch()
              .finally(() => setIsSending(false));
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

const StyledTextArea = styled(Textarea)`
  width: 100%;
  height: 200px;
`;

const ButtonArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

export default SubmitEvidenceModal;
