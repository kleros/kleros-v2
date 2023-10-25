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

const Header: React.FC = () => {
  return (
    <Container>
      <PlaceAndTitleAndRewardsAndCoherency>
        <Rank />
        <JurorTitle />
        <Rewards />
        <Coherency />
      </PlaceAndTitleAndRewardsAndCoherency>
      <HowItWorks />
    </Container>
  );
};

export default Header;
