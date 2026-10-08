import React, { useCallback, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { Answer as IAnswer } from "context/NewDisputeContext";
import { cn } from "utils/cn";
import { isUndefined } from "utils/index";
import { getSafeNavigationUrl } from "utils/urlValidation";

import { DisputeDetailsQuery, VotingHistoryQuery } from "src/graphql/graphql";

import ExternalLinkWarning from "components/ExternalLinkWarning";
import MarkdownRenderer from "components/MarkdownRenderer";
import { StyledSkeleton } from "components/StyledSkeleton";
import WithHelpTooltip from "components/WithHelpTooltip";

import CardLabel from "../DisputeView/CardLabels";
import { Divider } from "../Divider";
import RulingAndRewardsIndicators from "../Verdict/RulingAndRewardsIndicators";

import AliasDisplay from "./Alias";

export const AnswerTitleAndDescription = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(function AnswerTitleAndDescription({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cn("block", className)} />;
});

export const AnswerTitle = React.forwardRef<React.ElementRef<"small">, React.ComponentPropsWithoutRef<"small">>(
  function AnswerTitle({ className, ...props }, ref) {
    return <small {...props} ref={ref} className={cn("[display:inline]", className)} />;
  }
);

export const AnswerDescription = React.forwardRef<React.ElementRef<"small">, React.ComponentPropsWithoutRef<"small">>(
  function AnswerDescription({ className, ...props }, ref) {
    return (
      <small
        {...props}
        ref={ref}
        className={cn("[display:inline] font-normal text-klerosUIComponentsSecondaryText", className)}
      />
    );
  }
);

interface IDisputeContext {
  disputeDetails?: DisputeDetails;
  isRpcError?: boolean;
  dispute?: DisputeDetailsQuery | undefined;

  disputeId?: string;
  votingHistory?: VotingHistoryQuery | undefined;
}

export const DisputeContext: React.FC<IDisputeContext> = ({
  disputeDetails,
  isRpcError = false,
  dispute,
  disputeId,
  votingHistory,
}) => {
  const { isDisconnected } = useAccount();
  const { t } = useTranslation();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const errMsg = isRpcError ? t("errors.rpc_error") : t("errors.invalid_dispute_data");
  const rounds = votingHistory?.dispute?.rounds;
  const aliases = disputeDetails?.aliases;
  const jurorRewardsDispersed = useMemo(() => Boolean(rounds?.every((round) => round.jurorRewardsDispersed)), [rounds]);

  const frontendUrl = disputeDetails?.frontendUrl?.trim() || undefined;

  const safeFrontendUrl = useMemo(() => {
    return frontendUrl ? getSafeNavigationUrl(frontendUrl) : undefined;
  }, [frontendUrl]);

  const handleConfirmNavigation = useCallback(() => {
    if (safeFrontendUrl) {
      window.open(safeFrontendUrl, "_blank", "noopener,noreferrer");
    }
    setIsWarningOpen(false);
  }, [safeFrontendUrl]);

  const handleCancelNavigation = useCallback(() => {
    setIsWarningOpen(false);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1
          dir="auto"
          className={cn(
            "m-0 [word-wrap:break-word]",
            "text-[calc(20px_+_(26_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] leading-[24px]"
          )}
        >
          {isUndefined(disputeDetails) ? <StyledSkeleton /> : (disputeDetails?.title ?? errMsg)}
        </h1>
        {!isUndefined(disputeDetails) &&
        !isUndefined(dispute) &&
        !isUndefined(disputeId) &&
        !isUndefined(votingHistory) ? (
          <div className="flex flex-row flex-wrap gap-2">
            {!isUndefined(Boolean(dispute?.dispute?.ruled)) || jurorRewardsDispersed ? (
              <RulingAndRewardsIndicators
                ruled={Boolean(dispute?.dispute?.ruled)}
                jurorRewardsDispersed={jurorRewardsDispersed}
              />
            ) : null}
            {!isDisconnected ? (
              <CardLabel {...{ disputeId }} round={(rounds?.length ?? 0) - 1} isOverview={true} />
            ) : null}
          </div>
        ) : null}
        <Divider />
      </div>
      {disputeDetails?.question?.trim() || disputeDetails?.description?.trim() ? (
        <div>
          {disputeDetails?.question?.trim() ? (
            <div dir="auto" className="[&_p:first-of-type]:m-0">
              <MarkdownRenderer content={disputeDetails.question} />
            </div>
          ) : null}
          {disputeDetails?.description?.trim() ? (
            <div dir="auto" className="[&_p:first-of-type]:m-0">
              <MarkdownRenderer content={disputeDetails.description} />
            </div>
          ) : null}
        </div>
      ) : null}

      {!isUndefined(frontendUrl) && !isUndefined(safeFrontendUrl) ? (
        <>
          <a
            href={safeFrontendUrl}
            onClick={(event) => {
              event.preventDefault();
              setIsWarningOpen(true);
            }}
            className={cn(
              "text-klerosUIComponentsPrimaryBlue cursor-pointer [&:hover]:underline",
              "[&:hover]:text-klerosUIComponentsSecondaryBlue"
            )}
          >
            {t("misc.go_to_arbitrable")}
          </a>
          <ExternalLinkWarning
            isOpen={isWarningOpen}
            sanitizedUrl={safeFrontendUrl}
            originalUrl={frontendUrl}
            onConfirm={handleConfirmNavigation}
            onCancel={handleCancelNavigation}
          />
        </>
      ) : null}

      {!isUndefined(frontendUrl) && isUndefined(safeFrontendUrl) ? (
        <div className="flex flex-col gap-1 w-full">
          <small className="text-klerosUIComponentsPrimaryText font-semibold">{t("misc.arbitrable_url")}:</small>
          <WithHelpTooltip tooltipMsg={t("tooltips.unsafe_frontend_url")}>
            <span
              title={frontendUrl}
              className={cn(
                "max-w-full overflow-hidden [text-overflow:ellipsis] whitespace-nowrap",
                "text-klerosUIComponentsSecondaryText text-[14px]"
              )}
            >
              {frontendUrl}
            </span>
          </WithHelpTooltip>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        {isUndefined(disputeDetails) ? null : <small className="m-0">{t("headers.voting_options")}</small>}
        <div className="flex flex-col gap-[calc(4px_+_(2_-_4)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {disputeDetails?.answers?.map((answer: IAnswer, i: number) => (
            <AnswerTitleAndDescription dir="auto" key={answer.title}>
              <label>{i + 1}. </label>
              <AnswerTitle>{answer.title}</AnswerTitle>
              <AnswerDescription>{answer.description.trim() ? ` - ${answer.description}` : null}</AnswerDescription>
            </AnswerTitleAndDescription>
          ))}
        </div>
      </div>

      {isUndefined(aliases) ? null : (
        <>
          <Divider />
          <div className="flex flex-wrap gap-[calc(8px_+_(20_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
            {Object.keys(aliases).map((key) => (
              <AliasDisplay name={key} key={key} address={aliases[key]} />
            ))}
          </div>
        </>
      )}
    </>
  );
};
