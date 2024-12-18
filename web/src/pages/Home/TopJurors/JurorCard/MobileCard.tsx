import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import HeaderCoherence from "../Header/Coherence";
import HeaderRewards from "../Header/Rewards";

import Coherence from "./Coherence";
import JurorLevel from "./JurorLevel";
import JurorTitle from "./JurorTitle";
import Rank from "./Rank";
import Rewards from "./Rewards";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 8px 8px 12px;
  border 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  align-items: center;
  gap: 18px;

  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}
`;

const TopSide = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  align-items: center;
`;

const RankAndTitle = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const HeaderRewardsAndRewards = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 5px;
`;

const BottomSide = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const HeaderCoherenceAndCoherence = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;

  svg {
    margin-right: 0;
  }
`;

interface IMobileCard {
  rank: number;
  address: string;
  coherenceScore: number;
  totalCoherentVotes: number;
  totalResolvedVotes: number;
  totalResolvedDisputes: number;
}

const MobileCard: React.FC<IMobileCard> = ({
  rank,
  address,
  coherenceScore,
  totalCoherentVotes,
  totalResolvedVotes,
  totalResolvedDisputes,
}) => {
  return (
    <Container>
      <TopSide>
        <RankAndTitle>
          <Rank rank={rank} />
          <JurorTitle address={address} />
        </RankAndTitle>
        <JurorLevel {...{ coherenceScore, totalResolvedDisputes }} />
      </TopSide>
      <BottomSide>
        <HeaderRewardsAndRewards>
          <HeaderRewards />
          <Rewards address={address} />
        </HeaderRewardsAndRewards>
        <HeaderCoherenceAndCoherence>
          <HeaderCoherence />
          <Coherence {...{ totalCoherentVotes, totalResolvedVotes }} />
        </HeaderCoherenceAndCoherence>
      </BottomSide>
    </Container>
  );
};
export default MobileCard;
