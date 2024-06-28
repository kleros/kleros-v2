import React, { useCallback, useState } from "react";
import styled from "styled-components";

import Modal from "react-modal";
import { toast } from "react-toastify";
import { useWalletClient, usePublicClient, useConfig } from "wagmi";

import { Textarea, Button, FileUploader } from "@kleros/ui-components-library";

import { simulateEvidenceModuleSubmitEvidence } from "hooks/contracts/generated";
import { uploadFormDataToIPFS } from "utils/uploadFormDataToIPFS";
import { wrapWithToast, OPTIONS as toastOptions } from "utils/wrapWithToast";

import { EnsureAuth } from "components/EnsureAuth";
import { EnsureChain } from "components/EnsureChain";

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
  const wagmiConfig = useConfig();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File>();

  const submitEvidence = useCallback(async () => {
    setIsSending(true);
    const evidenceJSON = await constructEvidence(message, file);

    const { request } = await simulateEvidenceModuleSubmitEvidence(wagmiConfig, {
      args: [BigInt(evidenceGroup), JSON.stringify(evidenceJSON)],
    });

    if (!walletClient) return;
    await wrapWithToast(async () => await walletClient.writeContract(request), publicClient)
      .then(() => {
        setMessage("");
        close();
      })
      .finally(() => setIsSending(false));
  }, [publicClient, wagmiConfig, walletClient, close, evidenceGroup, file, message, setIsSending]);

  return (
    <StyledModal {...{ isOpen }}>
      <h1>Submit New Evidence</h1>
      <StyledTextArea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your Arguments" />
      <StyledFileUploader callback={(file: File) => setFile(file)} />
      <ButtonArea>
        <Button variant="secondary" disabled={isSending} text="Return" onClick={close} />
        <EnsureChain>
          <EnsureAuth>
            <Button text="Submit" isLoading={isSending} disabled={isSending} onClick={submitEvidence} />
          </EnsureAuth>
        </EnsureChain>
      </ButtonArea>
    </StyledModal>
  );
};

const constructEvidence = async (msg: string, file?: File) => {
  let fileURI: string | undefined = undefined;
  if (file) {
    toast.info("Uploading to IPFS", toastOptions);
    const fileFormData = new FormData();
    fileFormData.append("data", file, file.name);
    fileURI = await uploadFormDataToIPFS(fileFormData).then(async (res) => {
      const response = await res.json();
      return response["cids"][0];
    });
  }
  return { name: "Evidence", description: msg, fileURI };
};

export default SubmitEvidenceModal;
