import React from "react";
import styled, { css } from "styled-components";

import { useAccount } from "wagmi";

import { Card as _Card } from "@kleros/ui-components-library";

import { getUserLevelData } from "utils/userLevelCalculation";

import { useUserQuery } from "queries/useUser";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import Coherency from "./Coherency";
import Header from "./Header";
import JurorRewards from "./JurorRewards";
import PixelArt from "./PixelArt";

const Container = styled.div``;

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
      gap: ${responsiveSize(24, 64)};
      height: 236px;
    `
  )}
`;

const JurorInfo: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase() as `0x${string}`);
  // TODO check graph schema
  const coherenceScore = data?.user ? parseInt(data?.user?.coherenceScore) : 0;
  const totalCoherentVotes = data?.user ? parseInt(data?.user?.totalCoherentVotes) : 0;
  const totalResolvedVotes = data?.user ? parseInt(data?.user?.totalResolvedVotes) : 0;

  const userLevelData = getUserLevelData(coherenceScore);

  return (
    <Container>
      <Header
        levelTitle={userLevelData.title}
        levelNumber={userLevelData.level}
        {...{ totalCoherentVotes, totalResolvedVotes }}
      />
      <Card>
        <PixelArt level={userLevelData.level} width="189px" height="189px" />
        <Coherency userLevelData={userLevelData} isMiniGuide={false} {...{ totalCoherentVotes, totalResolvedVotes }} />
        <JurorRewards />
      </Card>
    </Container>
  );
};

export default JurorInfo;
