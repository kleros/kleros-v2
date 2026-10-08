import React from "react";

import { useTranslation } from "react-i18next";
import { Address } from "viem";

import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

import { useJurorsByCoherenceScore } from "queries/useJurorsByCoherenceScore";

import SeeAllJurorsButton from "components/SeeAllJurorsButton";
import { SkeletonDisputeListItem } from "components/StyledSkeleton";

import Header from "./Header";
import JurorCard from "./JurorCard";

export const ListContainer = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  function ListContainer({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cn("flex flex-col justify-center lg:grid lg:[grid-template-columns:1fr]", className)}
      />
    );
  }
);

export const StyledLabel = React.forwardRef<React.ElementRef<"label">, React.ComponentPropsWithoutRef<"label">>(
  function StyledLabel({ className, ...props }, ref) {
    return <label {...props} ref={ref} className={cn("text-[16px]", className)} />;
  }
);

const TopJurors: React.FC = () => {
  const { t } = useTranslation();
  const { data: queryJurors } = useJurorsByCoherenceScore(0, 5, "coherenceScore", "desc");

  const topJurors = queryJurors?.users?.map((juror, index) => ({
    ...juror,
    rank: index + 1,
  }));

  return (
    <div className="mt-[calc(28px_+_(48_-_28)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
      <div className="flex flex-row items-center gap-3 mb-[calc(12px_+_(24_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
        <h1 className="mb-0 text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {t("misc.top_jurors")}
        </h1>
        <SeeAllJurorsButton />
      </div>
      {!isUndefined(topJurors) && topJurors.length === 0 ? (
        <StyledLabel>{t("misc.no_jurors_found")}</StyledLabel>
      ) : (
        <ListContainer>
          <Header />
          {!isUndefined(topJurors)
            ? topJurors.map((juror) => <JurorCard key={juror.rank} {...juror} address={juror.id as Address} />)
            : [...Array(5)].map((_, i) => <SkeletonDisputeListItem key={i} />)}
        </ListContainer>
      )}
    </div>
  );
};
export default TopJurors;
