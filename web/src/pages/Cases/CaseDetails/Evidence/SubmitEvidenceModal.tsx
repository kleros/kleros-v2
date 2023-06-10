import React, { useState } from "react";
import styled from "styled-components";
import { useSigner } from "wagmi";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { Textarea, Button } from "@kleros/ui-components-library";
import { getDisputeKitClassic } from "hooks/contracts/generated";
import { wrapWithToast, OPTIONS as toastOptions } from "utils/wrapWithToast";
import { uploadFormDataToIPFS } from "utils/uploadFormDataToIPFS";

const SubmitEvidenceModal: React.FC<{
  isOpen: boolean;
  evidenceGroup: string;
  close: () => void;
}> = ({ isOpen, evidenceGroup, close }) => {
  const { data: signer } = useSigner();
  const disputeKit = getDisputeKitClassic({
    signerOrProvider: signer,
  });
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <StyledModal {...{ isOpen }}>
      <h1>Submit New Evidence</h1>
      <StyledTextArea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your Arguments" />
      <ButtonArea>
        <Button variant="secondary" disabled={isSending} text="Return" onClick={close} />
        <Button
          text="Submit"
          isLoading={isSending}
          disabled={isSending}
          onClick={() => {
            if (disputeKit) {
              setIsSending(true);
              const formData = constructEvidence(message);
              toast.info("Uploading to IPFS", toastOptions);
              uploadFormDataToIPFS(formData)
                .then(async (res) => {
                  const response = await res.json();
                  if (res.status === 200) {
                    const cid = "/ipfs/" + response["cid"];
                    await wrapWithToast(disputeKit.submitEvidence(BigInt(evidenceGroup), cid)).then(() => {
                      setMessage("");
                      close();
                    });
                  }
                })
                .catch()
                .finally(() => setIsSending(false));
            }
          }}
        />
      </ButtonArea>
    </StyledModal>
  );
};

const constructEvidence = (msg: string): FormData => {
  const formData = new FormData();
  const file = new File([JSON.stringify({ name: "Evidence", description: msg })], "evidence.json", {
    type: "text/plain",
  });
  formData.append("data", file, file.name);
  return formData;
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
