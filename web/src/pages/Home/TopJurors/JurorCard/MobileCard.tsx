import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import Coherency from "./Coherency";
import JurorLevel from "./JurorLevel";
import JurorTitle from "./JurorTitle";
import Rank from "./Rank";
import Rewards from "./Rewards";
import HeaderRewards from "../Header/Rewards";
import HeaderCoherency from "../Header/Coherency";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: 16px 24px 24px 24px;
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

const HeaderCoherencyAndCoherency = styled.div`
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
  totalCoherent: number;
  totalResolvedDisputes: number;
}

const MobileCard: React.FC<IMobileCard> = ({ rank, address, coherenceScore, totalCoherent, totalResolvedDisputes }) => {
  return (
    <Container>
      <TopSide>
        <RankAndTitle>
          <Rank rank={rank} />
          <JurorTitle address={address} />
        </RankAndTitle>
        <JurorLevel coherenceScore={coherenceScore} />
      </TopSide>
      <BottomSide>
        <HeaderRewardsAndRewards>
          <HeaderRewards />
          <Rewards address={address} />
        </HeaderRewardsAndRewards>
        <HeaderCoherencyAndCoherency>
          <HeaderCoherency />
          <Coherency totalCoherent={totalCoherent} totalResolvedDisputes={totalResolvedDisputes} />
        </HeaderCoherencyAndCoherency>
      </BottomSide>
    </Container>
  );
};
export default MobileCard;
