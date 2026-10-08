import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useMeasure } from "react-use";
import { formatEther } from "viem";

import { Card, LinearProgress, CustomRadioItem, RadioIndicator } from "@kleros/ui-components-library";

import Gavel from "svgs/icons/gavel.svg";

import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

interface IOptionCard {
  /** The option id; used as the radio group value when `selectable` is true. */
  value: string;
  text: string;
  funding: bigint;
  required?: bigint;
  winner?: boolean;
  /** When true, the card is wrapped in a `CustomRadioItem` (must live inside a `CustomRadio`)
   *  and renders a radio indicator. When false, the card is plain and can be rendered anywhere. */
  selectable?: boolean;
  /** Only meaningful when `selectable` is true; gates the radio item. */
  canBeSelected?: boolean;
}

const CardBody: React.FC<{
  text: string;
  fundingLabel: string;
  progress: number;
  width: number;
  winner: boolean;
  innerRef: (el: HTMLDivElement) => void;
  rightSlot?: React.ReactNode;
  role?: string;
  t: (key: string) => string;
}> = ({ text, fundingLabel, progress, width, winner, innerRef, rightSlot, role, t }) => (
  <Card hover role={role} className="[transition:0.1s] w-full p-4 lg:p-6">
    <div className="flex justify-between h-[50%]">
      <div className="flex flex-col grow min-w-0">
        <label className="block font-semibold overflow-hidden [text-overflow:ellipsis] whitespace-nowrap max-w-full">
          {text}
        </label>
        <label
          className={cn(
            "[&_svg]:w-3 [&_svg]:mr-2 [&_svg]:fill-current",
            winner ? "text-klerosUIComponentsSuccess" : "text-klerosUIComponentsWarning"
          )}
        >
          <Gavel />
          {t("appeal.jury_decision")} - {winner ? t("appeal.winner") : t("appeal.loser")}
        </label>
      </div>
      {rightSlot}
    </div>
    <div className="w-full flex justify-center">
      <label>{fundingLabel}</label>
    </div>
    <div ref={innerRef} className="w-full">
      <LinearProgress value={progress} width={width} />
    </div>
  </Card>
);

const OptionCard: React.FC<IOptionCard> = ({
  value,
  text,
  funding,
  required,
  winner,
  selectable = true,
  canBeSelected = true,
}) => {
  const { t } = useTranslation();
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const [fundingLabel, progress] = useMemo(() => {
    if (!isUndefined(required))
      if (funding >= required) return [t("appeal.fully_funded"), 100];
      else
        return [
          t("appeal.funding_progress", { funded: formatEther(funding), required: formatEther(required) }),
          Number((funding * 100n) / required),
        ];
    else if (funding > 0n) return [t("appeal.funded_with_amount", { amount: formatEther(funding) }), 30];
    else return [t("appeal.no_contributions"), 0];
  }, [funding, required, t]);

  if (!selectable) {
    return (
      <CardBody
        text={text}
        fundingLabel={fundingLabel}
        progress={progress}
        width={width}
        winner={!!winner}
        innerRef={ref}
        role="listitem"
        t={t}
      />
    );
  }

  return (
    <CustomRadioItem value={value} isDisabled={!canBeSelected} className="w-full">
      {(rp) => (
        <CardBody
          text={text}
          fundingLabel={fundingLabel}
          progress={progress}
          width={width}
          winner={!!winner}
          innerRef={ref}
          rightSlot={canBeSelected ? <RadioIndicator {...rp} /> : null}
          t={t}
        />
      )}
    </CustomRadioItem>
  );
};

export default OptionCard;
