import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import Header from "./Header";
import Coherency from "./Coherency";
import JurorRewards from "./JurorRewards";
import PixelArt from "./PixelArt";
import { useAccount } from "wagmi";
import { useUserQuery } from "queries/useUser";
import { getUserLevelData } from "utils/userLevelCalculation";
import StakingRewards from "./StakingRewards";

const Container = styled.div``;

const Card = styled(_Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;

  gap: 52px;
  width: 100%;
  height: auto;
  padding: 24px 32px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      gap: 68px calc(24px + (96 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      min-height: 236px;
    `
  )}
`;

const PixelArtAndCoherency = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      gap: 32px;
    `
  )}
`;

const JurorInfo: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase());
  const coherenceScore = data?.user ? parseInt(data?.user?.coherenceScore) : 0;
  const totalCoherent = data?.user ? parseInt(data?.user?.totalCoherent) : 0;
  const totalResolvedDisputes = data?.user ? parseInt(data?.user?.totalResolvedDisputes) : 0;

  const userLevelData = getUserLevelData(coherenceScore);

  return (
    <Container>
      <Header
        levelTitle={userLevelData.title}
        levelNumber={userLevelData.level}
        totalCoherent={totalCoherent}
        totalResolvedDisputes={totalResolvedDisputes}
      />
      <Card>
        <PixelArtAndCoherency>
          <PixelArt level={userLevelData.level} width="189px" height="189px" />
          <Coherency
            userLevelData={userLevelData}
            totalCoherent={totalCoherent}
            totalResolvedDisputes={totalResolvedDisputes}
            isMiniGuide={false}
          />
        </PixelArtAndCoherency>
        <JurorRewards />
        <StakingRewards />
      </Card>
    </Container>
  );
};

export default JurorInfo;
