import React from "react";
import styled from "styled-components";
import { BigNumber } from "ethers";
import StageExplainer from "../StageExplainer";
import OptionCard from "../../OptionCard";
import {
  useFundingContext,
  useLoserSideCountdownContext,
  useOptionsContext,
  useSelectedOptionContext,
} from "hooks/useClassicAppealContext";

const StageOne: React.FC = () => {
  const {
    paidFees,
    winningChoice,
    loserRequiredFunding,
    winnerRequiredFunding,
  } = useFundingContext();
  const options = useOptionsContext();
  const loserSideCountdown = useLoserSideCountdownContext();
  const { selectedOption, setSelectedOption } = useSelectedOptionContext();
  return (
    <Container>
      <StageExplainer {...{ loserSideCountdown }} />
      <label> Which option do you want to fund? </label>
      <OptionsContainer>
        {typeof paidFees !== "undefined" &&
          typeof winnerRequiredFunding !== "undefined" &&
          typeof loserRequiredFunding !== "undefined" &&
          options?.map((answer: string, i: number) => (
            <OptionCard
              key={answer}
              text={answer}
              selected={i === selectedOption}
              winner={i.toString() === winningChoice}
              funding={
                paidFees[i] ? BigNumber.from(paidFees[i]) : BigNumber.from(0)
              }
              required={
                i.toString() === winningChoice
                  ? winnerRequiredFunding
                  : loserRequiredFunding
              }
              onClick={() => setSelectedOption(i)}
            />
          ))}
      </OptionsContainer>
    </Container>
  );
};

const Container = styled.div`
  margin: 24px 0;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 12px;
`;

export default StageOne;
