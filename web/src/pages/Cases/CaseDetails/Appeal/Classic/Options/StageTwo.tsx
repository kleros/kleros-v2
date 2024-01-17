import React, { useEffect } from "react";
import styled from "styled-components";
import OptionCard from "../../OptionCard";
import {
  useCountdownContext,
  useFundingContext,
  useOptionsContext,
  useSelectedOptionContext,
} from "hooks/useClassicAppealContext";
import { isUndefined } from "utils/index";
import { formatUnitsWei } from "utils/format";
import StageExplainer from "../StageExplainer";
import Skeleton from "react-loading-skeleton";

const Container = styled.div`
  margin: 24px 0;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 12px;
`;

interface IStageTwo {
  setAmount: (val: string) => void;
}

const StageTwo: React.FC<IStageTwo> = ({ setAmount }) => {
  const { paidFees, winningChoice, winnerRequiredFunding, fundedChoices } = useFundingContext();
  const { winnerSideCountdown } = useCountdownContext();
  const options = useOptionsContext();
  const { selectedOption, setSelectedOption } = useSelectedOptionContext();
  useEffect(() => {
    if (!isUndefined(winningChoice)) setSelectedOption(parseInt(winningChoice));
    if (!isUndefined(winnerRequiredFunding)) setAmount(formatUnitsWei(winnerRequiredFunding));
  }, [winnerRequiredFunding, winningChoice]);

  return (
    <Container>
      {!isUndefined(winningChoice) && !isUndefined(fundedChoices) && !isUndefined(paidFees) ? (
        <>
          {fundedChoices.length > 0 && !fundedChoices.includes(winningChoice) ? (
            <>
              <StageExplainer stage={2} countdown={winnerSideCountdown} />
              <OptionsContainer>
                <OptionCard
                  text={options![winningChoice!]}
                  selected={parseInt(winningChoice) === selectedOption}
                  winner={true}
                  funding={paidFees![winningChoice!] ? BigInt(paidFees![winningChoice!]) : 0n}
                  required={winnerRequiredFunding!}
                  canBeSelected={false}
                  onClick={() => setSelectedOption(parseInt(winningChoice!, 10))}
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
