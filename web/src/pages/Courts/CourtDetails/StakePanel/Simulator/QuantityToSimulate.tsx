import React from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import { cn } from "utils/cn";
import { commify } from "utils/commify";
import { isUndefined } from "utils/index";

import WithHelpTooltip from "components/WithHelpTooltip";

export const TextWithTooltipContainer = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(function TextWithTooltipContainer({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        "text-klerosUIComponentsSecondaryPurple text-[14px] [&_>_div_svg]:fill-klerosUIComponentsSecondaryPurple [&_>_div_svg]:ml-1",
        className
      )}
    />
  );
});

export const Quantity = React.forwardRef<React.ElementRef<"p">, React.ComponentPropsWithoutRef<"p">>(function Quantity(
  { className, ...props },
  ref
) {
  return <p {...props} ref={ref} className={cn("text-[14px] text-klerosUIComponentsPrimaryText m-0", className)} />;
});

interface IQuantityToSimulate {
  jurorCurrentEffectiveStake: number | undefined;
  jurorCurrentSpecificStake: number | undefined;
  isStaking: boolean;
  amountToStake: number;
  className?: string;
}

const QuantityToSimulate: React.FC<IQuantityToSimulate> = ({
  isStaking,
  jurorCurrentEffectiveStake,
  jurorCurrentSpecificStake,
  amountToStake,
  className,
}) => {
  const { t } = useTranslation();
  const effectiveStakeDisplay = !isUndefined(jurorCurrentEffectiveStake) ? (
    `${commify(jurorCurrentEffectiveStake)} PNK`
  ) : (
    <Skeleton width={50} />
  );

  const amountStakedInThisCourt = !isUndefined(jurorCurrentSpecificStake)
    ? `${commify(jurorCurrentSpecificStake)} PNK`
    : "...";

  const amountStakedInSubCourts =
    !isUndefined(jurorCurrentEffectiveStake) && !isUndefined(jurorCurrentSpecificStake)
      ? `${commify(jurorCurrentEffectiveStake - jurorCurrentSpecificStake)} PNK`
      : "...";

  const finalQuantityValue =
    !isUndefined(jurorCurrentEffectiveStake) && !isUndefined(amountToStake)
      ? isStaking
        ? jurorCurrentEffectiveStake + amountToStake
        : jurorCurrentEffectiveStake - amountToStake
      : undefined;

  const finalQuantityDisplay = !isUndefined(finalQuantityValue) ? (
    `${commify(finalQuantityValue)} PNK`
  ) : (
    <Skeleton width={50} />
  );

  return (
    <div
      {...{ className }}
      className={cn("flex flex-row items-center flex-wrap gap-[0_8px] justify-center", className)}
    >
      <Quantity>{effectiveStakeDisplay}</Quantity>
      <TextWithTooltipContainer>
        <WithHelpTooltip
          tooltipMsg={t("tooltips.current_stake_sum", {
            amountInCourt: amountStakedInThisCourt,
            amountInSubCourts: amountStakedInSubCourts,
          })}
        >
          {t("staking.current_stake")}
        </WithHelpTooltip>
      </TextWithTooltipContainer>
      <p className="text-[14px] text-klerosUIComponentsSecondaryText m-0">{isStaking ? "+" : "-"}</p>
      <Quantity>{commify(amountToStake)} PNK</Quantity>
      <p className="text-[14px] text-klerosUIComponentsSecondaryText m-0">=</p>
      <Quantity className="font-semibold">{finalQuantityDisplay}</Quantity>
    </div>
  );
};

export default QuantityToSimulate;
