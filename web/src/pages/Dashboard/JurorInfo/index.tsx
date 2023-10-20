import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import Coherency from "./Coherency";
import JurorRewards from "./JurorRewards";
import PixelArt from "./PixelArt";
import { useAccount } from "wagmi";
import { useUserQuery } from "queries/useUser";
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

const levelTitles = [
  { scoreRange: [0, 20], level: 0, title: "Diogenes" },
  { scoreRange: [20, 40], level: 1, title: "Pythagoras" },
  { scoreRange: [40, 60], level: 2, title: "Socrates" },
  { scoreRange: [60, 80], level: 3, title: "Plato" },
  { scoreRange: [80, 100], level: 4, title: "Aristotle" },
];

const calculateCoherencyScore = (totalCoherent: number, totalDisputes: number): number =>
  totalCoherent / (Math.max(totalDisputes, 1) + 10);

const JurorInfo: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase());
  const totalCoherent = data?.user ? parseInt(data?.user?.totalCoherent) : 0;
  const totalResolvedDisputes = data?.user ? parseInt(data?.user?.totalResolvedDisputes) : 1;

  const coherencyScore = calculateCoherencyScore(totalCoherent, totalResolvedDisputes);
  const roundedCoherencyScore = Math.round(coherencyScore * 100);
  const userLevelData =
    levelTitles.find(({ scoreRange }) => {
      return roundedCoherencyScore >= scoreRange[0] && roundedCoherencyScore < scoreRange[1];
    }) ?? levelTitles[0];

  return (
    <Container>
      <Header>Juror Dashboard</Header>
      <Card>
        <PixelArt level={userLevelData.level} />
        <Coherency
          userLevelData={userLevelData}
          score={coherencyScore}
          totalCoherent={totalCoherent}
          totalResolvedDisputes={totalResolvedDisputes}
        />
        <JurorRewards />
      </Card>
    </Container>
  );
};

export default JurorInfo;
