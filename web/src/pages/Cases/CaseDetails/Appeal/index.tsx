import React from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { useToggle } from "react-use";

import { Periods } from "consts/periods";
import { useDisputeKitInfo } from "hooks/useDisputeKitInfo";
import { cn } from "utils/cn";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { isUndefined } from "src/utils";

import InfoCard from "components/InfoCard";

import AppealHistory from "./AppealHistory";

export const AppealHeader = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  function AppealHeader({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cn("flex flex-col items-center justify-between mb-6 gap-3 lg:flex-row", className)}
      />
    );
  }
);

export const StyledTitle = React.forwardRef<React.ElementRef<"h1">, React.ComponentPropsWithoutRef<"h1">>(
  function StyledTitle({ className, ...props }, ref) {
    return (
      <h1
        {...props}
        ref={ref}
        className={cn(
          "m-0 text-[calc(18px_+_(24_-_18)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
          className
        )}
      />
    );
  }
);

const Appeal: React.FC<{ currentPeriodIndex: number }> = ({ currentPeriodIndex }) => {
  const { t } = useTranslation();
  const [isAppealMiniGuideOpen, toggleAppealMiniGuide] = useToggle(false);
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const disputeKitAddress = disputeData?.dispute?.currentRound?.disputeKit?.address ?? undefined;
  const disputeKitInfo = useDisputeKitInfo({ disputeKitAddress });

  if (isUndefined(disputeKitInfo)) {
    return (
      <div className="p-4 lg:p-8">
        {isUndefined(disputeKitAddress) ? (
          <Skeleton height={200} />
        ) : (
          <InfoCard msg={t("alerts.unsupported_dispute_kit")} />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {Periods.appeal === currentPeriodIndex ? (
        <disputeKitInfo.AppealComponent
          isAppealMiniGuideOpen={isAppealMiniGuideOpen}
          toggleAppealMiniGuide={toggleAppealMiniGuide}
          disputeKitId={disputeKitInfo.id}
        />
      ) : (
        <AppealHistory isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
      )}
    </div>
  );
};

export default Appeal;
