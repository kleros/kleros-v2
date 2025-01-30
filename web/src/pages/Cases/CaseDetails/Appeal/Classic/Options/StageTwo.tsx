import React, { useEffect, useMemo } from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";

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

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

interface IStageTwo {
  setAmount: (val: string) => void;
}

const StageTwo: React.FC<IStageTwo> = ({ setAmount }) => {
  const { winningChoice, winnerRequiredFunding, fundedChoices } = useFundingContext();
  const { winnerSideCountdown } = useCountdownContext();
  const options = useOptionsContext();
  const { selectedOption, setSelectedOption } = useSelectedOptionContext();
  const choice = useMemo(() => options?.find((option) => option.id === winningChoice), [options, winningChoice]);

  useEffect(() => {
    if (!isUndefined(choice)) setSelectedOption(choice);
    if (!isUndefined(winnerRequiredFunding)) setAmount(formatUnitsWei(winnerRequiredFunding));
  }, [winnerRequiredFunding, choice]);

  return (
    <Container>
      {!isUndefined(choice) && !isUndefined(fundedChoices) ? (
        <>
          {fundedChoices.length > 0 && !choice.funded ? (
            <>
              <StageExplainer stage={2} countdown={winnerSideCountdown} />
              <OptionsContainer>
                <OptionCard
                  text={choice.title}
                  selected={choice.id === selectedOption?.id}
                  winner={true}
                  funding={BigInt(choice.paidFee ?? 0)}
                  required={winnerRequiredFunding!}
                  canBeSelected={false}
                  onClick={() => setSelectedOption(choice)}
                />
              </OptionsContainer>
            </>
          ) : (
            <label>No losing option has been funded in time, winner is maintained.</label>
          )}
        </>
      ) : (
        <Skeleton height={140} />
      )}
    </Container>
  );
};

export default StageTwo;
