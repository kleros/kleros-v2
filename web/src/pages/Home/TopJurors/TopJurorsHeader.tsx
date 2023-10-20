import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import WithHelpTooltip from "pages/Dashboard/WithHelpTooltip";
import BookOpenIcon from "tsx:assets/svgs/icons/book-open.svg";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  padding: 18.5px 32px;
  border 1px solid ${({ theme }) => theme.stroke};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
`;

const JurorData = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: calc(24px + (48 - 24) * ((100vw - 300px) / (1250 - 300)));
`;

const JurorTitle = styled.div`
  display: none;
  gap: 36px;
  align-items: center;
  label {
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: ${({ theme }) => theme.secondaryText} !important;
  }

  ${landscapeStyle(
    () =>
      css`
        display: flex;
        width: 372px;
      `
  )}
`;

const RewardsAndCoherency = styled.div`
  display: flex;
  gap: calc(52px + (104 - 52) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Rewards = styled.div`
  width: 132px;
`;

const HowItWorks = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    color: ${({ theme }) => theme.primaryBlue};
  }

  svg {
    path {
      fill: ${({ theme }) => theme.primaryBlue};
    }
  }
`;

const totalRewardsTooltipMsg =
  "Users have an economic interest in serving as jurors in Kleros: " +
  "collecting the Juror Rewards in exchange for their work. Each juror who " +
  "is coherent with the final ruling receive the Juror Rewards composed of " +
  "arbitration fees (ETH) + PNK redistribution between jurors.";

const coherentVotesTooltipMsg =
  "This is the ratio of coherent votes made by a juror: " +
  "the number in the left is the number of times where the juror " +
  "voted coherently and the number in the right is the total number of times " +
  "the juror voted";

const TopJurorsHeader: React.FC = () => {
  return (
    <Container>
      <JurorTitle>
        <label>#</label>
        <label>Juror</label>
      </JurorTitle>
      <JurorData>
        <RewardsAndCoherency>
          <Rewards>
            <WithHelpTooltip place="top" tooltipMsg={totalRewardsTooltipMsg}>
              <label> Total Rewards </label>
            </WithHelpTooltip>
          </Rewards>

          <WithHelpTooltip place="top" tooltipMsg={coherentVotesTooltipMsg}>
            <label> Coherent Votes </label>
          </WithHelpTooltip>
        </RewardsAndCoherency>
        <HowItWorks>
          <BookOpenIcon />
          <label> How it works </label>
        </HowItWorks>
      </JurorData>
    </Container>
  );
};

export default TopJurorsHeader;
