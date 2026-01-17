import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import { hoverShortTransitionTiming } from "styles/commonStyles";

import HeaderScore from "../Header/Score";
import HeaderCoherence from "../Header/Coherence";
import HeaderRewards from "../Header/Rewards";

import Coherence from "./Coherence";
import JurorLevel from "./JurorLevel";
import Rank from "./Rank";
import Rewards from "./Rewards";
import JurorLink from "components/JurorLink";
import Score from "./Score";

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
  align-items: center;
  gap: 8px;
`;

const BottomSide = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
`;

const HeaderScoreAndScore = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const HeaderCoherenceAndCoherence = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const HeaderRewardsAndRewards = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

interface IMobileCard {
  rank: number;
  address: string;
  totalCoherentVotes: string;
  totalResolvedVotes: string;
  coherenceScore: string;
}

const MobileCard: React.FC<IMobileCard> = ({
  rank,
  address,
  totalCoherentVotes,
  totalResolvedVotes,
  coherenceScore,
}) => {
  return (
    <Container>
      <TopSide>
        <RankAndTitle>
          {rank ? <Rank {...{ rank }} /> : null}
          <JurorLink {...{ address }} />
        </RankAndTitle>
        <JurorLevel coherenceScore={Number(coherenceScore)} />
      </TopSide>
      <BottomSide>
        <HeaderScoreAndScore>
          <HeaderScore />
          <Score {...{ coherenceScore }} />
        </HeaderScoreAndScore>
        <HeaderCoherenceAndCoherence>
          <HeaderCoherence />
          <Coherence {...{ totalCoherentVotes, totalResolvedVotes }} />
        </HeaderCoherenceAndCoherence>
        <HeaderRewardsAndRewards>
          <HeaderRewards />
          <Rewards {...{ address }} />
        </HeaderRewardsAndRewards>
      </BottomSide>
    </Container>
  );
};
export default MobileCard;
