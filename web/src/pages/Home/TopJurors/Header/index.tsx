import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import Rank from "./Rank";
import JurorTitle from "./JurorTitle";
import Rewards from "./Rewards";
import Coherency from "./Coherency";
import HowItWorks from "./HowItWorks";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  padding: 24px;
  border 1px solid ${({ theme }) => theme.stroke};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  border-bottom: none;
  flex-wrap: wrap;

  ${landscapeStyle(
    () =>
      css`
        border-bottom: 1px solid ${({ theme }) => theme.stroke};
        padding: 18.6px 32px;
      `
  )}
`;

const PlaceAndTitleAndRewardsAndCoherency = styled.div`
  display: none;

  ${landscapeStyle(
    () =>
      css`
        display: flex;
        flex-direction: row;
        gap: calc(20px + (28 - 20) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      `
  )}
`;

const StyledLabel = styled.label`
  ${landscapeStyle(
    () =>
      css`
        display: none;
      `
  )}
`;

const Header: React.FC = () => {
  return (
    <Container>
      <StyledLabel>Ranking</StyledLabel>
      <PlaceAndTitleAndRewardsAndCoherency>
        <Rank />
        <JurorTitle />
        <Rewards />
        <Coherency />
      </PlaceAndTitleAndRewardsAndCoherency>
      <HowItWorks onClick={() => toggleIsLevelMiniGuidesOpen()} />
    </Container>
  );
};

export default Header;
