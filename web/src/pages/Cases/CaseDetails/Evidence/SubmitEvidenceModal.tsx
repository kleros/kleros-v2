import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { useWalletClient, usePublicClient, useConfig } from "wagmi";

import { Roles, useAtlasProvider } from "@kleros/kleros-app";
import { Button, FileUploader } from "@kleros/ui-components-library";

import { simulateEvidenceModuleSubmitEvidence } from "hooks/contracts/generated";
import { wrapWithToast, errorToast, infoToast, successToast } from "utils/wrapWithToast";

import { getFileUploaderMsg, isEmpty } from "src/utils";

import EnsureAuth from "components/EnsureAuth";
import { EnsureChain } from "components/EnsureChain";
import MarkdownEditor from "components/MarkdownEditor";

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

const EditorContainer = styled.div`
  width: 100%;

  [class*="contentEditable"] {
    min-height: 200px;
  }
`;

const StyledFileUploader = styled(FileUploader)`
  width: 100%;
  margin-bottom: 50px;
`;

const ButtonArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const SubmitEvidenceModal: React.FC<{
  isOpen: boolean;
  disputeId: string;
  close: () => void;
}> = ({ isOpen, disputeId, close }) => {
  const { t } = useTranslation();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const wagmiConfig = useConfig();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File>();
  const { uploadFile, roleRestrictions } = useAtlasProvider();

  const isDisabled = useMemo(() => isSending || isEmpty(message), [isSending, message]);

  const submitEvidence = useCallback(async () => {
    try {
      setIsSending(true);
      const evidenceJSON = await constructEvidence(uploadFile, message, file, t);

      const { request } = await simulateEvidenceModuleSubmitEvidence(wagmiConfig, {
        args: [BigInt(disputeId), JSON.stringify(evidenceJSON)],
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
      errorToast(t("notifications.failed_to_submit_evidence"));
      console.error("Error in submitEvidence:", error);
    }
  }, [publicClient, wagmiConfig, walletClient, close, disputeId, file, message, setIsSending, uploadFile, t]);

  return (
    <StyledModal {...{ isOpen }} shouldCloseOnEsc shouldCloseOnOverlayClick onRequestClose={close}>
      <h1>{t("evidence.submit_new_evidence")}</h1>
      <EditorContainer>
        <MarkdownEditor
          value={message}
          onChange={setMessage}
          placeholder={t("forms.placeholders.describe_evidence")}
          showMessage={false}
        />
      </EditorContainer>
      <StyledFileUploader
        callback={(file: File) => setFile(file)}
        msg={getFileUploaderMsg(Roles.Evidence, roleRestrictions, t)}
        variant="info"
      />
      <ButtonArea>
        <Button variant="secondary" disabled={isSending} text={t("buttons.return")} onClick={close} />
        <EnsureChain>
          <EnsureAuth>
            <Button text={t("buttons.submit")} isLoading={isSending} disabled={isDisabled} onClick={submitEvidence} />
          </EnsureAuth>
        </EnsureChain>
      </ButtonArea>
    </StyledModal>
  );
};

const constructEvidence = async (
  uploadFile: (file: File, role: Roles) => Promise<string | null>,
  msg: string,
  file: File | undefined,
  t: (key: string) => string
) => {
  let fileURI: string | null = null;
  if (file) {
    infoToast(t("notifications.uploading_to_ipfs"));
    fileURI = await uploadFile(file, Roles.Evidence).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      errorToast(t("notifications.upload_failed_error", { error: err?.message }));
      return null;
    });
    if (!fileURI) throw new Error(t("notifications.error_uploading_evidence"));
    successToast(t("notifications.uploaded_successfully"));
  }
  return { name: "Evidence", description: msg, fileURI };
};

export default SubmitEvidenceModal;
