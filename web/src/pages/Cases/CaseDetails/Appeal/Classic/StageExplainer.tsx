import React, { useMemo } from "react";
import styled from "styled-components";
import { Box } from "@kleros/ui-components-library";
import { useCountdown } from "hooks/useCountdown";
import { secondsToDayHourMinute } from "utils/date";
import HourglassIcon from "svgs/icons/hourglass.svg";

interface IStageExplainer {
  lastPeriodChange: string;
  appealPeriodDuration: string;
  loserTimeMultiplier: string;
}

const StageExplainer: React.FC<IStageExplainer> = ({
  lastPeriodChange,
  appealPeriodDuration,
  loserTimeMultiplier,
}) => {
  const deadline = useMemo(
    () =>
      getDeadline(lastPeriodChange, appealPeriodDuration, loserTimeMultiplier),
    [lastPeriodChange, appealPeriodDuration, loserTimeMultiplier]
  );
  const timeLeft = useCountdown(deadline);
  return (
    <StyledBox>
      <CountdownLabel>
        <HourglassIcon />
        {secondsToDayHourMinute(timeLeft)}
      </CountdownLabel>
      <div>
        <label>
          Losing options can only be funded <small>before</small> the deadline.
        </label>
        <label>
          If no losing option is <small>fully funded</small> in time, the jury
          decision is maintained.
        </label>
      </div>
    </StyledBox>
  );
};

const getDeadline = (
  lastPeriodChange: string,
  appealPeriodDuration: string,
  loserTimeMultiplier: string
): number => {
  const parsedLastPeriodChange = parseInt(lastPeriodChange, 10);
  const parsedAppealPeriodDuration = parseInt(appealPeriodDuration, 10);
  const parsedLoserTimeMultiplier = parseInt(loserTimeMultiplier, 10);
  const loserAppealPeriodDuration =
    parsedAppealPeriodDuration * parsedLoserTimeMultiplier;
  return loserAppealPeriodDuration + parsedLastPeriodChange;
};

const StyledBox = styled(Box)`
  border-radius: 3px;
  margin: 24px 0;
  height: auto;
  width: 100%;
  padding: 16px 24px;
  & > div > label {
    display: block;
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
  & > svg {
    width: 14px;
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

export default StageExplainer;
