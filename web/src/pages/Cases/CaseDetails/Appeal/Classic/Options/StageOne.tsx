import React from "react";

import { useTranslation } from "react-i18next";

import { CustomRadio } from "@kleros/ui-components-library";

import {
  useCountdownContext,
  useFundingContext,
  useOptionsContext,
  useSelectedOptionContext,
} from "hooks/useClassicAppealContext";
import { formatUnitsWei } from "utils/format";
import { isUndefined } from "utils/index";

import OptionCard from "../../OptionCard";
import StageExplainer from "../StageExplainer";

interface IStageOne {
  setAmount: (val: string) => void;
}

const StageOne: React.FC<IStageOne> = ({ setAmount }) => {
  const { t } = useTranslation();
  const { winningChoice, loserRequiredFunding, winnerRequiredFunding } = useFundingContext();
  const options = useOptionsContext();
  const { loserSideCountdown } = useCountdownContext();
  const { selectedOption, setSelectedOption } = useSelectedOptionContext();

  return (
    <div className="m-[24px_0]">
      <StageExplainer countdown={loserSideCountdown} stage={1} />
      <label>{t("appeal.which_option_to_fund")}</label>
      {!isUndefined(winnerRequiredFunding) && !isUndefined(loserRequiredFunding) ? (
        <CustomRadio
          aria-label={t("appeal.which_option_to_fund")}
          value={selectedOption?.id ?? null}
          onChange={(id) => {
            const option = options?.find((o) => o.id === id);
            if (isUndefined(option)) return;
            setSelectedOption(option);
            setAmount(formatUnitsWei(option.id === winningChoice ? winnerRequiredFunding : loserRequiredFunding));
          }}
          className="grid [grid-template-columns:repeat(auto-fit,_minmax(250px,_1fr))] gap-4 mt-3"
        >
          {options?.map((option) => (
            <OptionCard
              key={option.id}
              value={option.id}
              text={option.title}
              winner={option.id === winningChoice}
              funding={BigInt(option.paidFee ?? 0)}
              required={option.id === winningChoice ? winnerRequiredFunding : loserRequiredFunding}
              canBeSelected={!option?.funded}
            />
          ))}
        </CustomRadio>
      ) : null}
    </div>
  );
};

export default StageOne;
