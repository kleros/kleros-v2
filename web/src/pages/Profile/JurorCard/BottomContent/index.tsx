import React from "react";
import styled, { css } from "styled-components";

import { Address } from "viem";

import { ILevelCriteria } from "utils/userLevelCalculation";

import { landscapeStyle } from "styles/landscapeStyle";

import StakingRewards from "../StakingRewards";

import Coherence from "./Coherence";
import JurorRewards from "./JurorRewards";
import PixelArt from "./PixelArt";

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
  searchParamAddress: Address;
}

const BottomContent: React.FC<IBottomContent> = ({
  userLevelData,
  totalCoherentVotes,
  totalResolvedVotes,
  searchParamAddress,
}) => {
  return (
    <Container>
      <LeftContent>
        <PixelArt level={userLevelData.level} width="189px" height="189px" />
        <Coherence isMiniGuide={false} {...{ userLevelData, totalCoherentVotes, totalResolvedVotes }} />
        <JurorRewards {...{ searchParamAddress }} />
      </LeftContent>
      <StakingRewards />
    </Container>
  );
};
export default BottomContent;
