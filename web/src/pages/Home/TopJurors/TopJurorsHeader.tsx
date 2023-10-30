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
  padding: 24px;
  border 1px solid ${({ theme }) => theme.stroke};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  flex-wrap: wrap;

  ${landscapeStyle(
    () =>
      css`
        flex-wrap: nowrap;
        gap: 0px;
        padding: 18.6px 32px;
      `
  )}
`;

const PlaceAndTitleAndRewardsAndCoherency = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${landscapeStyle(
    () =>
      css`
        flex-direction: row;
        gap: 32px;
      `
  )}
`;

const JurorPlace = styled.div`
  width: 100%;

  label {
    &::before {
      content: "# Rank";
      visibility: visible;
    }
  }

  ${landscapeStyle(
    () =>
      css`
        width: calc(16px + (24 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

        label {
          &::before {
            content: "#";
          }
        }
      `
  )}
`;

const JurorTitle = styled.div`
  display: flex;
  gap: 16px;
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
        width: calc(40px + (220 - 40) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
        gap: 36px;
      `
  )}
`;

const Rewards = styled.div`
  ${landscapeStyle(
    () =>
      css`
        width: calc(60px + (240 - 60) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      `
  )}
`;

const Coherency = styled.div``;

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
      <PlaceAndTitleAndRewardsAndCoherency>
        <JurorPlace>
          <label></label>
        </JurorPlace>
        <JurorTitle>
          <label>Juror</label>
        </JurorTitle>
        <Rewards>
          <WithHelpTooltip place="top" tooltipMsg={totalRewardsTooltipMsg}>
            <label> Total Rewards </label>
          </WithHelpTooltip>
        </Rewards>
        <Coherency>
          <WithHelpTooltip place="top" tooltipMsg={coherentVotesTooltipMsg}>
            <label> Coherent Votes </label>
          </WithHelpTooltip>
        </Coherency>
      </PlaceAndTitleAndRewardsAndCoherency>
      <HowItWorks>
        <BookOpenIcon />
        <label> How it works </label>
      </HowItWorks>
    </Container>
  );
};

export default TopJurorsHeader;
