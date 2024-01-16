import React from "react";
import styled from "styled-components";
import { Box } from "@kleros/ui-components-library";
import { secondsToDayHourMinute } from "utils/date";
import HourglassIcon from "svgs/icons/hourglass.svg";
import { isUndefined } from "utils/index";
import { useFundingContext, useOptionsContext } from "hooks/useClassicAppealContext";
import Skeleton from "react-loading-skeleton";

const StyledBox = styled(Box)`
  border-radius: 3px;
  margin: 24px 0;
  height: auto;
  width: 100%;
  padding: 16px 24px;
  & > div > label {
    display: block;
    margin-bottom: 4px;
  }
`;

const CountdownLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.secondaryPurple};
  color: ${({ theme }) => theme.primaryText};
  gap: 8px;
  & > svg {
    width: 14px;
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

interface IStageExplainer {
  countdown?: number | undefined;
  stage: 1 | 2;
}

const StageOneExplanation: React.FC = () => (
  <>
    {" "}
    <label>
      Losing options can only be funded <small>before</small> the deadline.
    </label>
    <label>
      If no losing option is <small>fully funded</small> in time, the jury decision is maintained.
    </label>
  </>
);

const StageTwoExplanation: React.FC = () => {
  const { fundedChoices } = useFundingContext();
  const options = useOptionsContext();
  return (
    <>
      <label>Loser deadline has finalized, you can only fund the current winner.</label>
      <label>
        The sum of funds must reach 100%. If it's not fully funded in time the option fully funded at stage 1 is
        declared the winner of the case.{" "}
      </label>
      <label>
        {" "}
        Following choice was funded in the stage 1 :{" "}
        <small>
          {!isUndefined(fundedChoices) && !isUndefined(options)
            ? fundedChoices.map((choice) =>
                isUndefined(options[choice]) ? <Skeleton width={50} height={18} /> : options[choice]
              )
            : null}
        </small>
      </label>
    </>
  );
};

const StageExplainer: React.FC<IStageExplainer> = ({ countdown, stage }) => {
  return (
    <StyledBox>
      <CountdownLabel>
        <HourglassIcon />
        {!isUndefined(countdown) ? secondsToDayHourMinute(countdown) : null}
      </CountdownLabel>
      <div>{stage === 1 ? <StageOneExplanation /> : <StageTwoExplanation />}</div>
    </StyledBox>
  );
};

export default StageExplainer;
