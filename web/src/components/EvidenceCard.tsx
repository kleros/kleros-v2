import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Hash } from "viem";

import { Card } from "@kleros/ui-components-library";

import AttachmentIcon from "svgs/icons/attachment.svg";

import { cn } from "utils/cn";
import { formatDate } from "utils/date";
import { getIpfsUrl } from "utils/getIpfsUrl";

import { type Evidence } from "src/graphql/graphql";
import { getTxnExplorerLink, isUndefined } from "src/utils";

import JurorLink from "components/JurorLink";

import { ExternalLink } from "./ExternalLink";
import { InternalLink } from "./InternalLink";
import MarkdownRenderer from "./MarkdownRenderer";

const AttachedFileText: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <span className="hidden lg:[display:inline]">{t("misc.view_attached_file")}</span>
      <span className="lg:hidden">{t("misc.file")}</span>
    </>
  );
};

interface IEvidenceCard extends Pick<Evidence, "evidence" | "name" | "description" | "fileURI"> {
  sender?: string;
  index?: number;
  transactionHash?: Hash;
  timestamp?: string;
}

const EvidenceCard: React.FC<IEvidenceCard> = ({
  evidence,
  sender,
  index,
  timestamp,
  transactionHash,
  name,
  description,
  fileURI,
}) => {
  const { i18n } = useTranslation();
  const { id } = useParams();
  const profileLink = `/profile/stakes/1?address=${sender}`;

  const transactionExplorerLink = useMemo(() => {
    if (isUndefined(transactionHash)) return undefined;
    return getTxnExplorerLink(transactionHash);
  }, [transactionHash]);

  return (
    <Card className="w-full h-auto">
      <div
        dir="auto"
        className={cn(
          "flex flex-col p-4 gap-1 [overflow-wrap:break-word] [&>*]:[overflow-wrap:break-word] [&>*]:m-0",
          "[&&_p]:m-0 [&_h3]:inline-block [&&_h3]:m-0 lg:p-[20px_24px]"
        )}
      >
        <div className="flex flex-row items-center gap-1.25">
          {isUndefined(index) ? null : <p className="inline-block text-klerosUIComponentsSecondaryText">#{index}. </p>}
          <h3>{name}</h3>
        </div>
        {name && description ? (
          <div dir="auto">
            <MarkdownRenderer content={description} />
          </div>
        ) : (
          <div dir="auto">
            <MarkdownRenderer content={evidence} />
          </div>
        )}
      </div>
      <div
        className={cn(
          "bg-klerosUIComponentsLightBlue flex flex-wrap items-center justify-between p-4 [&>*]:[flex-basis:1]",
          "[&>*]:shrink-0 [&>*]:m-0 lg:p-[12px_24px]"
        )}
      >
        <div
          className={cn(
            "flex gap-2 flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-[0_12px]",
            "lg:[&>*:not(:last-child)]:mb-0"
          )}
        >
          {isUndefined(sender) ? null : (
            <InternalLink
              to={profileLink}
              className={cn(
                "[&_label]:text-klerosUIComponentsPrimaryText [&:hover_label]:cursor-pointer",
                "[&:hover_label]:text-klerosUIComponentsSecondaryBlue [&_svg]:hidden"
              )}
            >
              <JurorLink address={sender} />
            </InternalLink>
          )}
          {isUndefined(timestamp) || isUndefined(transactionExplorerLink) ? null : (
            <ExternalLink
              to={transactionExplorerLink}
              rel="noopener noreferrer"
              target="_blank"
              className={cn(
                "[&:hover]:underline [&:hover]:text-klerosUIComponentsPrimaryBlue [&:hover]:cursor-pointer",
                "[&:hover_label]:underline [&:hover_label]:text-klerosUIComponentsPrimaryBlue",
                "[&:hover_label]:cursor-pointer"
              )}
            >
              <label>{formatDate(Number(timestamp), true, i18n.language)}</label>
            </ExternalLink>
          )}
        </div>
        {fileURI && fileURI !== "-" ? (
          <div className="ml-auto">
            <InternalLink
              to={`/attachment/?disputeId=${id}&title=misc.evidence_file&url=${getIpfsUrl(fileURI)}`}
              className={cn(
                "[transition:0.1s] flex gap-[calc(5px_+_(6_-_5)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
                "[&>svg]:w-[16px] [&>svg]:fill-klerosUIComponentsPrimaryBlue",
                "[&:hover_svg]:fill-klerosUIComponentsSecondaryBlue"
              )}
            >
              <AttachmentIcon />
              <AttachedFileText />
            </InternalLink>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default EvidenceCard;
