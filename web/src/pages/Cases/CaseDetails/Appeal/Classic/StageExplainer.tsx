import React from "react";
import styled from "styled-components";
import { Box } from "@kleros/ui-components-library";
import { secondsToDayHourMinute } from "utils/date";
import HourglassIcon from "svgs/icons/hourglass.svg";

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
  gap: 8px;
  & > svg {
    width: 14px;
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

interface IStageExplainer {
  loserSideCountdown: number | undefined;
}

const StageExplainer: React.FC<IStageExplainer> = ({ loserSideCountdown }) => (
  <StyledBox>
    <CountdownLabel>
      <HourglassIcon />
      {typeof loserSideCountdown !== "undefined" && secondsToDayHourMinute(loserSideCountdown)}
    </CountdownLabel>
    <div>
      <label>
        Losing options can only be funded <small>before</small> the deadline.
      </label>
      <label>
        If no losing option is <small>fully funded</small> in time, the jury decision is maintained.
      </label>
    </div>
  </StyledBox>
);

export default StageExplainer;
