import React from "react";
import styled from "styled-components";

import { Box } from "@kleros/ui-components-library";

import HourglassIcon from "svgs/icons/hourglass.svg";

import { useOptionsContext } from "hooks/useClassicAppealContext";
import { secondsToDayHourMinute } from "utils/date";
import { isUndefined } from "utils/index";

const StyledBox = styled(Box)`
  border-radius: 3px;
  margin: 24px 0;
  height: auto;
  width: 100%;
  padding: 16px 24px;
  & > div > p {
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
  countdown: number | undefined;
  stage: 1 | 2;
}

const StageOneExplanation: React.FC = () => (
  <div>
    {" "}
    <p>
      Losing options can only be funded <small>before</small> the deadline.
    </p>
    <p>
      If no losing option is <small>fully funded</small> in time, the jury decision is maintained.
    </p>
  </div>
);

const StageTwoExplanation: React.FC = () => {
  const options = useOptionsContext();
  return (
    <div>
      <p>
        Loser deadline has <small>finalized</small>, you can only fund the current winner.
      </p>
      <p>
        If the current winner is not fully funded in time, the option funded during the previous stage will be declared
        as the final winner.
      </p>
      <p>
        {" "}
        Following choices were funded in the stage 1 :{" "}
        <small>{options?.map((option) => (option?.funded ? option.title : null))}</small>
      </p>
    </div>
  );
};

const StageExplainer: React.FC<IStageExplainer> = ({ countdown, stage }) => {
  return (
    <StyledBox>
      <CountdownLabel>
        {!isUndefined(countdown) ? (
          <>
            <HourglassIcon />
            {countdown > 0 ? secondsToDayHourMinute(countdown) : <span>Time's up</span>}
          </>
        ) : null}
      </CountdownLabel>
      {stage === 1 ? <StageOneExplanation /> : <StageTwoExplanation />}
    </StyledBox>
  );
};

export default StageExplainer;
