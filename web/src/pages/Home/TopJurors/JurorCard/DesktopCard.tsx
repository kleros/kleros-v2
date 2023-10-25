import React from "react";
import { landscapeStyle } from "styles/landscapeStyle";
import styled, { css } from "styled-components";
import Rank from "./Rank";
import JurorTitle from "./JurorTitle";
import Rewards from "./Rewards";
import Coherency from "./Coherency";
import HowItWorks from "./HowItWorks";

const Container = styled.div`
  display: none;

  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  align-items: center;
  padding: 15.55px 32px;

  label {
    font-size: 16px;
  }

  ${landscapeStyle(
    () => css`
      display: flex;
    `
  )}
`;

const PlaceAndTitleAndRewardsAndCoherency = styled.div`
  display: flex;
  flex-direction: row;
  gap: calc(20px + (28 - 20) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

interface IDesktopCard {
  rank: number;
  address: string;
  totalCoherent: number;
  totalResolvedDisputes: number;
  coherenceScore: number;
}

const DesktopCard: React.FC<IDesktopCard> = ({
  rank,
  address,
  totalCoherent,
  totalResolvedDisputes,
  coherenceScore,
}) => {
  return (
    <Container>
      <PlaceAndTitleAndRewardsAndCoherency>
        <Rank rank={rank} />
        <JurorTitle address={address} />
        <Rewards address={address} />
        <Coherency totalCoherent={totalCoherent} totalResolvedDisputes={totalResolvedDisputes} />
      </PlaceAndTitleAndRewardsAndCoherency>
      <HowItWorks coherenceScore={coherenceScore} />
    </Container>
  );
};
export default DesktopCard;
