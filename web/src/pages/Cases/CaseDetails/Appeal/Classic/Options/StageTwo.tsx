import React, { useEffect, useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

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

const Container = styled.div`
  margin: 24px 0;
`;

const OptionsGroup = styled(CustomRadio)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

interface IStageTwo {
  setAmount: (val: string) => void;
}

const StageTwo: React.FC<IStageTwo> = ({ setAmount }) => {
  const { t } = useTranslation();
  const { winningChoice, winnerRequiredFunding, fundedChoices } = useFundingContext();
  const { winnerSideCountdown } = useCountdownContext();
  const options = useOptionsContext();
  const { selectedOption, setSelectedOption } = useSelectedOptionContext();
  const choice = useMemo(() => options?.find((option) => option.id === winningChoice), [options, winningChoice]);

  useEffect(() => {
    if (!isUndefined(choice)) setSelectedOption(choice);
    if (!isUndefined(winnerRequiredFunding)) setAmount(formatUnitsWei(winnerRequiredFunding));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winnerRequiredFunding, choice]);

  return (
    <Container>
      {!isUndefined(choice) && !isUndefined(fundedChoices) ? (
        <>
          {fundedChoices.length > 0 && !choice.funded ? (
            <>
              <StageExplainer stage={2} countdown={winnerSideCountdown} />
              <OptionsGroup
                aria-label={t("appeal.which_option_to_fund")}
                value={selectedOption?.id ?? null}
                onChange={() => {}}
              >
                <OptionCard
                  value={choice.id}
                  text={choice.title}
                  winner={true}
                  funding={BigInt(choice.paidFee ?? 0)}
                  required={winnerRequiredFunding!}
                  canBeSelected={false}
                />
              </OptionsGroup>
            </>
          ) : (
            <label>{t("appeal.no_losing_option_funded")}</label>
          )}
        </>
      ) : (
        <Skeleton height={140} />
      )}
    </Container>
  );
};

export default StageTwo;
