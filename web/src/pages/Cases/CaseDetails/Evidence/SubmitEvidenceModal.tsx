import React, { useCallback, useMemo, useState } from "react";

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
    <Modal
      {...{ isOpen }}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      onRequestClose={close}
      className="absolute top-[50%] left-[50%] right-auto bottom-auto mr-[-50%] [transform:translate(-50%,_-50%)] h-auto w-[80%] border border-solid border-klerosUIComponentsStroke rounded-[3px] bg-klerosUIComponentsWhiteBackground flex flex-col items-center p-4 gap-4"
    >
      <h1>{t("evidence.submit_new_evidence")}</h1>
      <div className={'w-full [&_[class*="contentEditable"]]:min-h-[200px]'}>
        <MarkdownEditor
          value={message}
          onChange={setMessage}
          placeholder={t("forms.placeholders.describe_evidence")}
          showMessage={false}
        />
      </div>
      <FileUploader
        callback={(file: File) => setFile(file)}
        msg={getFileUploaderMsg(Roles.Evidence, roleRestrictions, t)}
        variant="info"
        className={
          'w-full mb-12.5 [&_small]:text-[14px] [&_svg:has(+_[id="dropzone-label"])]:fill-klerosUIComponentsSecondaryText [&_svg:has(+_[id="dropzone-label"])_path]:fill-klerosUIComponentsSecondaryText [&_div:has(>_[id="dropzone-label"])]:items-start'
        }
      />
      <div className="w-full flex justify-between">
        <Button variant="secondary" isDisabled={isSending} text={t("buttons.return")} onPress={close} />
        <EnsureChain>
          <EnsureAuth>
            <Button text={t("buttons.submit")} isLoading={isSending} isDisabled={isDisabled} onPress={submitEvidence} />
          </EnsureAuth>
        </EnsureChain>
      </div>
    </Modal>
  );
};

const constructEvidence = async (
  uploadFile: (file: File, role: Roles) => Promise<string | null>,
  msg: string,
  file: File | undefined,
  t: (key: string, options?: Record<string, string>) => string
) => {
  let fileURI: string | null = null;
  if (file) {
    infoToast(t("notifications.uploading_to_ipfs"));
    fileURI = await uploadFile(file, Roles.Evidence).catch((err: Error) => {
      console.error(err);
      errorToast(t("notifications.upload_failed_error", { error: err?.message }));
      return null;
    });
    if (!fileURI) throw new Error(t("notifications.error_uploading_evidence"));
    successToast(t("notifications.uploaded_successfully"));
  }
  return { name: "Evidence", description: msg, fileURI };
};

export default SubmitEvidenceModal;
