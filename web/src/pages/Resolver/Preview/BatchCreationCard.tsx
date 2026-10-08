import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useDebounce } from "react-use";

import { Card, Switch } from "@kleros/ui-components-library";

import { CoinIds } from "consts/coingecko";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { useCoinPrice } from "hooks/useCoinPrice";
import { cn } from "utils/cn";
import { formatETH, formatUnitsWei, formatUSD } from "utils/format";

import { isUndefined } from "src/utils";

import { Divider } from "components/Divider";
import PlusMinusField from "components/PlusMinusField";
import WithHelpTooltip from "components/WithHelpTooltip";

const Label = React.forwardRef<React.ElementRef<"p">, React.ComponentPropsWithoutRef<"p">>(function Label(
  { className, ...props },
  ref
) {
  return (
    <p {...props} ref={ref} className={cn("p-0 m-0 text-[16px] text-klerosUIComponentsSecondaryText", className)} />
  );
});

const BatchCreationCard: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, isBatchCreation, setIsBatchCreation, batchSize, setBatchSize } = useNewDisputeContext();
  const [localBatchSize, setLocalBatchSize] = useState(batchSize);
  useDebounce(() => setBatchSize(localBatchSize), 500, [localBatchSize]);

  const { prices: pricesData } = useCoinPrice([CoinIds.ETH]);

  const coinPrice = !isUndefined(pricesData) ? pricesData[CoinIds.ETH]?.price : undefined;

  return (
    <Card className="w-full h-fit">
      <div className="w-full min-h-[64px] flex items-center flex-wrap gap-4 p-4 [&_span::before]:bg-klerosUIComponentsWhiteBackground! lg:p-[0px_32px]">
        <Switch
          aria-label={t("case_creation.create_multiple_cases")}
          isSelected={isBatchCreation}
          onChange={() => setIsBatchCreation(!isBatchCreation)}
        />
        <WithHelpTooltip tooltipMsg={t("case_creation.batch_cases_tooltip")}>
          <p className="p-0 m-0 text-[16px] text-klerosUIComponentsPrimaryText">
            {t("case_creation.create_multiple_cases")}
          </p>
        </WithHelpTooltip>
      </div>
      {isBatchCreation ? (
        <>
          <Divider />
          <div className="w-full min-h-[64px] flex flex-wrap items-center justify-start gap-4 p-4 lg:justify-between lg:p-[16px_32px]">
            <div className="flex items-center flex-wrap gap-4 lg:gap-8">
              <div className="min-w-[64px] min-h-[64px] bg-klerosUIComponentsLightBackground border border-solid border-klerosUIComponentsStroke rounded-[3px] text-[32px] text-klerosUIComponentsPrimaryBlue text-center [align-content:center]">
                {localBatchSize}
              </div>
              <PlusMinusField
                minValue={2}
                currentValue={localBatchSize}
                updateValue={(val) => setLocalBatchSize(val)}
                className="m-0 [&_path]:fill-klerosUIComponentsWhiteBackground"
              />
              <Label>({t("case_creation.number_of_cases_to_be_created")})</Label>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-2">
                <Label>{t("case_creation.jurors_per_case")}</Label>
                <Label className="font-semibold text-klerosUIComponentsPrimaryText">{disputeData.numberOfJurors}</Label>
              </div>
              <div className="flex gap-2">
                <Label>{t("case_creation.total")}</Label>
                <Label className="font-semibold text-klerosUIComponentsPrimaryText">
                  {(disputeData.numberOfJurors ?? 0) * localBatchSize}
                </Label>
              </div>
              <div className="flex gap-2">
                <Label>{t("case_creation.total_cost")}</Label>
                <Label className="font-semibold text-klerosUIComponentsPrimaryText">
                  {formatETH(BigInt(disputeData.arbitrationCost ?? 0) * BigInt(localBatchSize))} ETH{" "}
                </Label>
                {!isUndefined(coinPrice) ? (
                  <Label>
                    ~
                    {formatUSD(
                      Number(formatUnitsWei(BigInt(disputeData.arbitrationCost ?? 0) * BigInt(localBatchSize))) *
                        coinPrice
                    )}
                  </Label>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
};

export default BatchCreationCard;
