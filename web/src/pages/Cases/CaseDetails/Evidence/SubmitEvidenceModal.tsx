import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { Textarea, Button, FileUploader } from "@kleros/ui-components-library";
import { wrapWithToast, OPTIONS as toastOptions } from "utils/wrapWithToast";
import { uploadFormDataToIPFS } from "utils/uploadFormDataToIPFS";
import { useWalletClient, usePublicClient } from "wagmi";
import { EnsureChain } from "components/EnsureChain";
import { prepareWriteEvidenceModule } from "hooks/contracts/generated";

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

const StyledFileUploader = styled(FileUploader)`
  width: 100%;
`;

const ButtonArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const SubmitEvidenceModal: React.FC<{
  isOpen: boolean;
  evidenceGroup: bigint;
  close: () => void;
}> = ({ isOpen, evidenceGroup, close }) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File>();
  return (
    <StyledModal {...{ isOpen }}>
      <h1>Submit New Evidence</h1>
      <StyledTextArea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your Arguments" />
      <StyledFileUploader callback={(file: File) => setFile(file)} />
      <ButtonArea>
        <Button variant="secondary" disabled={isSending} text="Return" onClick={close} />
        <EnsureChain>
          <Button
            text="Submit"
            isLoading={isSending}
            disabled={isSending}
            onClick={async () => {
              setIsSending(true);
              toast.info("Uploading to IPFS", toastOptions);
              const formData = await constructEvidence(message, file);
              uploadFormDataToIPFS(formData)
                .then(async (res) => {
                  const response = await res.json();
                  if (res.status === 200 && walletClient) {
                    const cid = response["cids"][0];
                    const { request } = await prepareWriteEvidenceModule({
                      functionName: "submitEvidence",
                      args: [BigInt(evidenceGroup), cid],
                    });
                    await wrapWithToast(async () => await walletClient.writeContract(request), publicClient).then(
                      () => {
                        setMessage("");
                        close();
                      }
                    );
                  }
                })
                .catch()
                .finally(() => setIsSending(false));
            }}
          />
        </EnsureChain>
      </ButtonArea>
    </StyledModal>
  );
};

const constructEvidence = async (msg: string, file?: File): Promise<FormData> => {
  let fileURI: string | undefined = undefined;
  if (file) {
    const fileFormData = new FormData();
    fileFormData.append("data", file, file.name);
    fileURI = await uploadFormDataToIPFS(fileFormData).then(async (res) => {
      const response = await res.json();
      return response["cids"][0];
    });
  }
  const formData = new FormData();
  const evidenceFile = new File([JSON.stringify({ name: "Evidence", description: msg, fileURI })], "evidence.json", {
    type: "text/plain",
  });
  formData.append("data", evidenceFile, evidenceFile.name);
  return formData;
};

export default SubmitEvidenceModal;
