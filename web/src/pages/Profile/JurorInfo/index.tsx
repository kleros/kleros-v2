import React from "react";
import styled, { css } from "styled-components";

import { Card as _Card } from "@kleros/ui-components-library";

import { getUserLevelData } from "utils/userLevelCalculation";
import { getCoherencePercent } from "utils/getCoherencePercent";

import { useUserQuery } from "queries/useUser";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import Coherence from "./Coherence";
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

interface IJurorInfo {
  addressToQuery: `0x${string}`;
}

const JurorInfo: React.FC<IJurorInfo> = ({ addressToQuery }) => {
  const { data } = useUserQuery(addressToQuery);
  const totalCoherentVotes = data?.user ? parseInt(data?.user?.totalCoherentVotes) : 0;
  const totalResolvedVotes = data?.user ? parseInt(data?.user?.totalResolvedVotes) : 0;
  const totalResolvedDisputes = data?.user ? parseInt(data?.user?.totalResolvedDisputes) : 0;
  const coherencePercentage = getCoherencePercent(Number(totalCoherentVotes), Number(totalResolvedVotes));
  const userLevelData = getUserLevelData(coherencePercentage, totalResolvedDisputes);

  return (
    <Container>
      <Header
        levelTitle={userLevelData.title}
        levelNumber={userLevelData.level}
        {...{ totalCoherentVotes, totalResolvedVotes, addressToQuery }}
      />
      <Card>
        <PixelArt level={userLevelData.level} width="189px" height="189px" />
        <Coherence isMiniGuide={false} {...{ userLevelData, totalCoherentVotes, totalResolvedVotes }} />
        <JurorRewards {...{ addressToQuery }} />
      </Card>
    </Container>
  );
};

export default JurorInfo;
