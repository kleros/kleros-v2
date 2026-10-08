import React from "react";

import { useTranslation } from "react-i18next";

import { useAtlasProvider, Roles } from "@kleros/kleros-app";
import { FileUploader } from "@kleros/ui-components-library";

import PolicyIcon from "svgs/icons/policy.svg";

import { useNewDisputeContext } from "context/NewDisputeContext";
import useIsDesktop from "hooks/useIsDesktop";
import { getIpfsUrl } from "utils/getIpfsUrl";
import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

import { getFileUploaderMsg, isUndefined } from "src/utils";

import { InternalLink } from "components/InternalLink";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Policy: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData, setIsPolicyUploading } = useNewDisputeContext();
  const { uploadFile, roleRestrictions } = useAtlasProvider();
  const isDesktop = useIsDesktop();
  const handleFileUpload = (file: File) => {
    setIsPolicyUploading(true);
    infoToast(t("toasts.uploading_to_ipfs"));

    uploadFile(file, Roles.Policy)
      .then(async (cid) => {
        if (!cid) return;
        successToast(t("toasts.uploaded_successfully"));
        setDisputeData({ ...disputeData, policyURI: cid });
      })
      .catch((err) => {
        console.error(err);
        errorToast(t("toasts.upload_failed", { error: err?.message }));
      })
      .finally(() => setIsPolicyUploading(false));
  };

  return (
    <div className="flex flex-col items-center lg:pb-20.5">
      <Header text={t("headers.submit_policy_file")} />
      <label className="w-[84vw] mb-12 lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))]">
        {t("misc.fundamental_to_any_case")}
      </label>

      <FileUploader
        callback={handleFileUpload}
        variant={isDesktop ? "info" : undefined}
        msg={`${t("misc.you_can_attach_additional")}\n${getFileUploaderMsg(Roles.Policy, roleRestrictions, t)}`}
        className={
          'w-[84vw] mb-[calc(150px_+_(72_-_150)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))] [&_small]:[white-space:pre-line] [&_small]:text-start [&_small]:text-[14px] [&_svg:has(+_[id="dropzone-label"])]:fill-klerosUIComponentsSecondaryText [&_svg:has(+_[id="dropzone-label"])_path]:fill-klerosUIComponentsSecondaryText [&_div:has(>_[id="dropzone-label"])]:items-start'
        }
      />
      {!isUndefined(disputeData.policyURI) ? (
        <InternalLink
          to={`/attachment/?title=misc.policy_file&url=${getIpfsUrl(disputeData.policyURI)}`}
          className="[transition:0.1s] flex gap-1 self-start mb-8 mt-8 [&:hover_svg]:fill-klerosUIComponentsSecondaryBlue"
        >
          <PolicyIcon className="w-[16px] fill-klerosUIComponentsPrimaryBlue" />
          {t("misc.inspect_uploaded_policy")}
        </InternalLink>
      ) : null}
      <NavigationButtons prevRoute="/resolver/notable-persons" nextRoute="/resolver/preview" />
    </div>
  );
};
export default Policy;
