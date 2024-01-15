import React, { useEffect } from "react";
import styled from "styled-components";
import OptionCard from "../../OptionCard";
import { useFundingContext, useOptionsContext, useSelectedOptionContext } from "hooks/useClassicAppealContext";
import { isUndefined } from "utils/index";
import { formatUnitsWei } from "utils/format";
import Skeleton from "react-loading-skeleton";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 24px 0;
  justify-content: center;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 12px;
`;

const StyledLabel = styled.label`
  margin-bottom: 6px;
`;
interface IStageTwo {
  setAmount: (val: string) => void;
}

const StageTwo: React.FC<IStageTwo> = ({ setAmount }) => {
  const { paidFees, winningChoice, winnerRequiredFunding, fundedChoices } = useFundingContext();
  const options = useOptionsContext();
  const { selectedOption, setSelectedOption } = useSelectedOptionContext();
  useEffect(() => {
    if (!isUndefined(winningChoice)) setSelectedOption(parseInt(winningChoice));
    if (!isUndefined(winnerRequiredFunding)) setAmount(formatUnitsWei(winnerRequiredFunding));
  });

  return (
    <Container>
      {!isUndefined(winningChoice) &&
      !isUndefined(fundedChoices) &&
      !isUndefined(paidFees) &&
      !isUndefined(options) &&
      fundedChoices.length > 0 &&
      !fundedChoices.includes(winningChoice) ? (
        <>
          <StyledLabel>Loser deadline has finalized, you can only fund the current winner.</StyledLabel>
          <StyledLabel>
            Following choice was funded in the stage one :{" "}
            <small>
              {fundedChoices.map((choice) =>
                isUndefined(options[choice]) ? <Skeleton width={50} height={18} /> : options[choice]
              )}
            </small>
          </StyledLabel>
          <OptionsContainer>
            <OptionCard
              text={options![winningChoice!]}
              selected={winningChoice === selectedOption}
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
    </Container>
  );
};

export default StageTwo;
