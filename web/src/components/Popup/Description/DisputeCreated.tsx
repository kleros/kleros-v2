import React, { useMemo } from "react";

import { Trans, useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import { useCourtDetails } from "hooks/queries/useCourtDetails";
import { cn } from "utils/cn";
import { formatDate, getCurrentTime } from "utils/date";
import { isUndefined } from "utils/index";

const StyledTitle = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  function StyledTitle({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          "ml-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "mr-[calc(8px_+_(44_-_8)_*_(min(max(100vw,_300px),_1250px)_-_300px)_/_(950))]",
          "text-klerosUIComponentsSecondaryText text-center",
          className
        )}
      />
    );
  }
);

interface IDisputeCreated {
  courtId: string;
}

const DisputeCreated: React.FC<IDisputeCreated> = ({ courtId }) => {
  const { t, i18n } = useTranslation();
  const { data: courtDetails } = useCourtDetails(courtId);

  const date = useMemo(
    () =>
      // Using court.timesPerPeriod here since at creation time both per-round and per-court periods are same.
      !isUndefined(courtDetails?.court?.timesPerPeriod)
        ? calculateMinResolveTime(courtDetails?.court.timesPerPeriod)
        : undefined,
    [courtDetails]
  );

  return (
    <div className="flex flex-col mb-6">
      <StyledTitle>
        <Trans
          i18nKey="popups.dispute_created_full_message"
          components={{
            date: isUndefined(date) ? (
              <Skeleton width={60} height={20} />
            ) : (
              <span className="text-klerosUIComponentsPrimaryText">{formatDate(date, false, i18n.language)}</span>
            ),
          }}
        />
      </StyledTitle>
      <StyledTitle className="mt-6 text-klerosUIComponentsPrimaryText">{t("popups.submit_evidence_now")}</StyledTitle>
    </div>
  );
};

const calculateMinResolveTime = (timesPerPeriod: string[]) =>
  timesPerPeriod.reduce((acc, val) => acc + parseInt(val), 0) + getCurrentTime();

export default DisputeCreated;
