import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import Rank from "./Rank";
import JurorTitle from "./JurorTitle";
import { useUserQuery } from "hooks/queries/useUser";
import Rewards from "./Rewards";
import Coherency from "./Coherency";
import HowItWorks from "./HowItWorks";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 24px;
  border 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  align-items: center;

  label {
    font-size: 16px;
  }

  ${landscapeStyle(
    () => css`
      gap: 0px;
      padding: 15.55px 32px;
      flex-wrap: nowrap;
    `
  )}
`;

const PlaceAndTitleAndRewardsAndCoherency = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${landscapeStyle(
    () =>
      css`
        flex-direction: row;
        gap: 32px;
      `
  )}
`;

interface IJurorCard {
  rank: number;
  address: `0x${string}`;
  coherenceScore: number;
  totalCoherent: number;
  totalResolvedDisputes: number;
}

const JurorCard: React.FC<IJurorCard> = ({ rank, address, coherenceScore, totalCoherent, totalResolvedDisputes }) => {
  const { data } = useUserQuery(address?.toLowerCase());

  return (
    <Container>
      <PlaceAndTitleAndRewardsAndCoherency>
        <Rank rank={rank} />
        <JurorTitle address={address} />
        <Rewards data={data} />
        <Coherency totalCoherent={totalCoherent} totalResolvedDisputes={totalResolvedDisputes} />
      </PlaceAndTitleAndRewardsAndCoherency>
      <HowItWorks coherenceScore={coherenceScore} />
    </Container>
  );
};

export default JurorCard;
