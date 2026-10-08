import React, { useId, useRef } from "react";

import { useTranslation } from "react-i18next";

import { BigNumberField, Card, CustomRadioItem, RadioIndicator } from "@kleros/ui-components-library";

import CaseFromScratchIcon from "svgs/icons/caseFromScratch.svg";
import DuplicateCaseIcon from "svgs/icons/duplicateCase.svg";

import { cn } from "utils/cn";

import { Divider } from "components/Divider";
import WithHelpTooltip from "components/WithHelpTooltip";

export enum CreationMethod {
  Scratch,
  Duplicate,
}

const StyledRadioIndicator = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadioIndicator>) => (
  <RadioIndicator {...props} className={cn("self-center ml-4", className)} />
);

interface ICreationCard {
  cardMethod: CreationMethod;
  selectedMethod: CreationMethod;
  disputeID?: string;
  setDisputeID?: (id?: string) => void;
  isInvalidDispute?: boolean;
}

const CreationCard: React.FC<ICreationCard> = ({
  cardMethod,
  selectedMethod,
  disputeID,
  setDisputeID,
  isInvalidDispute,
}) => {
  const { t } = useTranslation();
  const selected = cardMethod === selectedMethod;
  const Icon = cardMethod === CreationMethod.Scratch ? CaseFromScratchIcon : DuplicateCaseIcon;
  const disputeIdLabelId = useId();
  const disputeIdInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card
      hover
      className={cn(
        "h-fit w-full",
        selected ? "bg-klerosUIComponentsWhiteBackground" : "bg-klerosUIComponentsLightBackground"
      )}
    >
      <CustomRadioItem value={String(cardMethod)} className="w-full">
        {(rp) => (
          <div className="w-full p-[12px_calc(16px_+_(24_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] flex items-center gap-[calc(8px_+_(16_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
            <Icon className="w-12 h-12 [&_circle]:fill-klerosUIComponentsLightBlue [&_circle]:stroke-klerosUIComponentsPrimaryBlue [&_path]:fill-klerosUIComponentsPrimaryBlue" />
            <p className="p-0 text-[16px] flex-1 text-klerosUIComponentsPrimaryText">
              {cardMethod === CreationMethod.Scratch
                ? t("case_creation.create_from_scratch")
                : t("case_creation.duplicate_existing_case")}
            </p>
            <StyledRadioIndicator {...rp} />
          </div>
        )}
      </CustomRadioItem>
      {cardMethod === CreationMethod.Duplicate && selected ? (
        <>
          <Divider />
          <div className="w-full p-[16px_calc(16px_+_(24_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] flex items-center flex-wrap gap-[calc(8px_+_(16_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
            <WithHelpTooltip tooltipMsg={t("case_creation.case_id_tooltip")}>
              <label id={disputeIdLabelId} className="text-[14px] text-klerosUIComponentsPrimaryText">
                {t("forms.labels.enter_cases_id")}
              </label>
            </WithHelpTooltip>
            <BigNumberField
              inputRef={disputeIdInputRef}
              inputProps={{ "aria-labelledby": disputeIdLabelId }}
              placeholder={t("forms.placeholders.case_id_example")}
              value={disputeID}
              // TODO(ui-components-library): read `id` directly once the field reports an emptied
              // input as empty (same issue as useBigNumberFieldReset). It reports 0 today, and 0
              // is a real dispute, so the raw text tells "cleared" apart from "0".
              onChange={(id) =>
                setDisputeID?.(id.isZero() && !disputeIdInputRef.current?.value.trim() ? undefined : id.toString())
              }
              minValue="0"
              isWheelDisabled
              formatOptions={{ groupSeparator: "" }}
              variant={isInvalidDispute ? "error" : undefined}
              className="max-w-[128px]"
            />
            {isInvalidDispute ? (
              <small className="text-[16px] font-normal text-klerosUIComponentsError">
                {t("forms.messages.invalid_dispute")}
              </small>
            ) : null}
          </div>
        </>
      ) : null}
    </Card>
  );
};

export default CreationCard;
