import React from "react";
import styled from "styled-components";

import { Card as _Card } from "@kleros/ui-components-library";

import { getUserLevelData } from "utils/userLevelCalculation";

import { useUserQuery } from "queries/useUser";

import { Divider } from "components/Divider";

import BottomContent from "./BottomContent";
import Header from "./Header";
import TopContent from "./TopContent";

const Container = styled.div``;

const Card = styled(_Card)`
  display: flex;
  flex-direction: column;
  justify-content: center;

  gap: 24px;
  width: 100%;
  height: auto;
  padding: 24px;
`;

interface IJurorCard {
  searchParamAddress: `0x${string}`;
}

const JurorCard: React.FC<IJurorCard> = ({ searchParamAddress }) => {
  const { data } = useUserQuery(searchParamAddress);
  const totalCoherentVotes = data?.user ? parseInt(data?.user?.totalCoherentVotes) : 0;
  const totalResolvedVotes = data?.user ? parseInt(data?.user?.totalResolvedVotes) : 0;
  const totalResolvedDisputes = data?.user ? parseInt(data?.user?.totalResolvedDisputes) : 0;
  const coherenceScore = data?.user ? parseInt(data?.user?.coherenceScore) : 0;
  const userLevelData = getUserLevelData(coherenceScore);

  return (
    <Container>
      <Header
        levelTitle={userLevelData.title}
        levelNumber={userLevelData.level}
        {...{ totalCoherentVotes, totalResolvedVotes, searchParamAddress }}
      />
      <Card>
        <TopContent address={searchParamAddress} {...{ totalResolvedDisputes }} />
        <Divider />
        <BottomContent {...{ userLevelData, totalCoherentVotes, totalResolvedVotes, searchParamAddress }} />
      </Card>
    </Container>
  );
};

export default JurorCard;
