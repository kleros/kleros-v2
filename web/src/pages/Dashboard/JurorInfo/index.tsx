import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import Coherency from "./Coherency";
import JurorRewards from "./JurorRewards";
import PixelArt from "./PixelArt";
import { useAccount } from "wagmi";
import { useUserQuery } from "queries/useUser";
import { getUserLevelData } from "utils/userLevelCalculation";
// import StakingRewards from "./StakingRewards";

const Container = styled.div``;

const Header = styled.h1`
  margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Card = styled(_Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 40px;
  width: 100%;
  height: auto;
  padding: 24px 0;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      gap: calc(24px + (64 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      height: 236px;
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
      <Header>Juror Dashboard</Header>
      <Card>
        <PixelArt level={userLevelData.level} width="189px" height="189px" />
        <Coherency
          userLevelData={userLevelData}
          totalCoherent={totalCoherent}
          totalResolvedDisputes={totalResolvedDisputes}
          isMiniGuide={false}
        />
        <JurorRewards />
      </Card>
    </Container>
  );
};

export default JurorInfo;
