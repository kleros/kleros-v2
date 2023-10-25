import React from "react";
import styled from "styled-components";
import StageExplainer from "../StageExplainer";
import OptionCard from "../../OptionCard";
import {
  useFundingContext,
  useLoserSideCountdownContext,
  useOptionsContext,
  useSelectedOptionContext,
} from "hooks/useClassicAppealContext";
import { isUndefined } from "utils/index";
import { formatUnitsWei } from "utils/format";

const Container = styled.div`
  margin: 24px 0;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 12px;
`;

interface IStageOne {
  setAmount: (val: string) => void;
}

const StageOne: React.FC<IStageOne> = ({ setAmount }) => {
  const { paidFees, winningChoice, loserRequiredFunding, winnerRequiredFunding } = useFundingContext();
  const options = useOptionsContext();
  const loserSideCountdown = useLoserSideCountdownContext();
  const { selectedOption, setSelectedOption } = useSelectedOptionContext();

  return (
    <Container>
      <StageExplainer {...{ loserSideCountdown }} />
      <label> Which option do you want to fund? </label>
      <OptionsContainer>
        {!isUndefined(paidFees) &&
          !isUndefined(winnerRequiredFunding) &&
          !isUndefined(loserRequiredFunding) &&
          options?.map((answer: string, i: number) => {
            const requiredFunding = i.toString() === winningChoice ? winnerRequiredFunding : loserRequiredFunding;
            return (
              <OptionCard
                key={answer}
                text={answer}
                selected={i === selectedOption}
                winner={i.toString() === winningChoice}
                funding={paidFees[i] ? BigInt(paidFees[i]) : 0n}
                required={requiredFunding}
                onClick={() => {
                  setSelectedOption(i);
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
