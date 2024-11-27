import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import Modal from "react-modal";
import { useWalletClient, usePublicClient, useConfig } from "wagmi";

import { Textarea, Button, FileUploader } from "@kleros/ui-components-library";

import { useAtlasProvider, Roles } from "@kleros/kleros-app";
import { simulateEvidenceModuleSubmitEvidence } from "hooks/contracts/generated";
import { wrapWithToast, errorToast, infoToast, successToast } from "utils/wrapWithToast";

import EnsureAuth from "components/EnsureAuth";
import { EnsureChain } from "components/EnsureChain";
import { isEmpty } from "src/utils";

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
  const { uploadFile } = useAtlasProvider();

  const isDisabled = useMemo(() => isSending || isEmpty(message), [isSending, message]);

  const submitEvidence = useCallback(async () => {
    try {
      setIsSending(true);
      const evidenceJSON = await constructEvidence(uploadFile, message, file);

      const { request } = await simulateEvidenceModuleSubmitEvidence(wagmiConfig, {
        args: [BigInt(evidenceGroup), JSON.stringify(evidenceJSON)],
      });

      if (!walletClient || !publicClient) return;
      await wrapWithToast(async () => await walletClient.writeContract(request), publicClient)
        .then(() => {
          setMessage("");
          close();
        })
        .finally(() => setIsSending(false));
    } catch (error) {
      setIsSending(false);
      errorToast("Failed to submit evidence.");
      console.error("Error in submitEvidence:", error);
    }
  }, [publicClient, wagmiConfig, walletClient, close, evidenceGroup, file, message, setIsSending, uploadFile]);

  return (
    <StyledModal {...{ isOpen }} shouldCloseOnEsc shouldCloseOnOverlayClick onRequestClose={close}>
      <h1>Submit New Evidence</h1>
      <StyledTextArea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your Arguments" />
      <StyledFileUploader callback={(file: File) => setFile(file)} />
      <ButtonArea>
        <Button variant="secondary" disabled={isSending} text="Return" onClick={close} />
        <EnsureChain>
          <EnsureAuth>
            <Button text="Submit" isLoading={isSending} disabled={isDisabled} onClick={submitEvidence} />
          </EnsureAuth>
        </EnsureChain>
      </ButtonArea>
    </StyledModal>
  );
};

const constructEvidence = async (
  uploadFile: (file: File, role: Roles) => Promise<string | null>,
  msg: string,
  file?: File
) => {
  let fileURI: string | null = null;
  if (file) {
    infoToast("Uploading to IPFS");
    fileURI = await uploadFile(file, Roles.Evidence).catch((err) => {
      console.log(err);
      errorToast(`Upload failed: ${err?.message}`);
      return null;
    });
    if (!fileURI) throw new Error("Error uploading evidence file");
    successToast("Uploaded successfully!");
  }
  return { name: "Evidence", description: msg, fileURI };
};

export default SubmitEvidenceModal;
