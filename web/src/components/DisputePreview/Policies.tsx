import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import PaperclipIcon from "svgs/icons/paperclip.svg";
import PolicyIcon from "svgs/icons/policy.svg";

import { cn } from "utils/cn";
import { getIpfsUrl } from "utils/getIpfsUrl";
import { isUndefined } from "utils/index";

import { InternalLink } from "components/InternalLink";

type Attachment = {
  label?: string;
  uri: string;
};
interface IPolicies {
  disputePolicyURI?: string;
  courtId?: string;
  attachment?: Attachment;
}

export const Policies: React.FC<IPolicies> = ({ disputePolicyURI, courtId, attachment }) => {
  const { id } = useParams();
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex items-center flex-row flex-wrap gap-[12px_16px] p-[12px_16px_20px]",
        "bg-klerosUIComponentsMediumBlue lg:p-[20px_32px]"
      )}
    >
      <p className="text-[14px] m-0 text-klerosUIComponentsPrimaryBlue">{t("misc.policy_documents")}</p>
      {!isUndefined(attachment) && !isUndefined(attachment.uri) ? (
        <InternalLink
          to={`/attachment/?disputeId=${id}&title=misc.case_policy&url=${getIpfsUrl(attachment.uri)}`}
          className="[transition:0.1s] flex gap-1 [&:hover_svg]:fill-klerosUIComponentsSecondaryBlue"
        >
          <PaperclipIcon className="w-[16px] fill-klerosUIComponentsPrimaryBlue" />
          {attachment.label ?? t("misc.attachment")}
        </InternalLink>
      ) : null}
      {isUndefined(disputePolicyURI) ? null : (
        <InternalLink
          to={`/attachment/?disputeId=${id}&title=misc.dispute_policy&url=${getIpfsUrl(disputePolicyURI)}`}
          className="[transition:0.1s] flex gap-1 [&:hover_svg]:fill-klerosUIComponentsSecondaryBlue"
        >
          <PolicyIcon className="w-[16px] fill-klerosUIComponentsPrimaryBlue" />
          {t("misc.dispute_policy")}
        </InternalLink>
      )}
      {isUndefined(courtId) ? null : (
        <InternalLink
          to={`/courts/${courtId}/policy?section=description`}
          className="[transition:0.1s] flex gap-1 [&:hover_svg]:fill-klerosUIComponentsSecondaryBlue"
        >
          <PolicyIcon className="w-[16px] fill-klerosUIComponentsPrimaryBlue" />
          {t("misc.court_policy")}
        </InternalLink>
      )}
    </div>
  );
};
