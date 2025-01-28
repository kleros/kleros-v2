import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import { hoverShortTransitionTiming } from "styles/commonStyles";

import HeaderCoherence from "../Header/Coherence";
import HeaderRewards from "../Header/Rewards";

import Coherence from "./Coherence";
import JurorLevel from "./JurorLevel";
import JurorTitle from "./JurorTitle";
import Rank from "./Rank";
import Rewards from "./Rewards";

const Container = styled.div`
  ${hoverShortTransitionTiming}
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 8px 16px 12px;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  align-items: center;
  gap: 16px;

  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}

  :hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }
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
  gap: 8px;
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
  gap: 8px;

  svg {
    margin-right: 0;
  }
`;

interface IMobileCard {
  rank: number;
  address: string;
  totalCoherentVotes: string;
  totalResolvedVotes: string;
  totalResolvedDisputes: string;
}

const MobileCard: React.FC<IMobileCard> = ({
  rank,
  address,
  totalCoherentVotes,
  totalResolvedVotes,
  totalResolvedDisputes,
}) => {
  return (
    <Container>
      <TopSide>
        <RankAndTitle>
          {rank ? <Rank rank={rank} /> : null}
          <JurorTitle address={address} />
        </RankAndTitle>
        <JurorLevel {...{ totalCoherentVotes, totalResolvedVotes, totalResolvedDisputes }} />
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
