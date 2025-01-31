import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import { ILevelCriteria } from "utils/userLevelCalculation";

import PixelArt from "./PixelArt";
import Coherence from "./Coherence";
import JurorRewards from "./JurorRewards";
import StakingRewards from "../StakingRewards";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;

  gap: 32px;
  width: 100%;
  height: auto;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      align-items: flex-start;
    `
  )}
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;
  flex-direction: column;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
    `
  )}
`;

interface IBottomContent {
  userLevelData: ILevelCriteria;
  totalCoherentVotes: number;
  totalResolvedVotes: number;
  addressToQuery: `0x${string}`;
}

const BottomContent: React.FC<IBottomContent> = ({
  userLevelData,
  totalCoherentVotes,
  totalResolvedVotes,
  addressToQuery,
}) => {
  return (
    <Container>
      <LeftContent>
        <PixelArt level={userLevelData.level} width="189px" height="189px" />
        <Coherence isMiniGuide={false} {...{ userLevelData, totalCoherentVotes, totalResolvedVotes }} />
        <JurorRewards {...{ addressToQuery }} />
      </LeftContent>
      <StakingRewards />
    </Container>
  );
};
export default BottomContent;
