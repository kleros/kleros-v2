import React from "react";
import styled from "styled-components";

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

interface IStageOne {
  setAmount: (val: string) => void;
}

const StageOne: React.FC<IStageOne> = ({ setAmount }) => {
  const { winningChoice, loserRequiredFunding, winnerRequiredFunding } = useFundingContext();
  const options = useOptionsContext();
  const { loserSideCountdown } = useCountdownContext();
  const { selectedOption, setSelectedOption } = useSelectedOptionContext();

  return (
    <Container>
      <StageExplainer countdown={loserSideCountdown} stage={1} />
      <label> Which option do you want to fund? </label>
      <OptionsContainer>
        {!isUndefined(winnerRequiredFunding) &&
          !isUndefined(loserRequiredFunding) &&
          options?.map((option) => {
            const requiredFunding = option.id === winningChoice ? winnerRequiredFunding : loserRequiredFunding;
            return (
              <OptionCard
                key={option.id}
                text={option.title}
                selected={option.id === selectedOption?.id}
                winner={option.id === winningChoice}
                funding={BigInt(option.paidFee ?? 0)}
                required={requiredFunding}
                canBeSelected={!option?.funded}
                onClick={() => {
                  setSelectedOption(option);
                  setAmount(formatUnitsWei(requiredFunding));
                }}
              />
            );
          })}
      </OptionsContainer>
    </Container>
  );
};

export default StageOne;
