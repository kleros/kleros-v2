import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import { hoverShortTransitionTiming } from "styles/commonStyles";

import Coherence from "./Coherence";
import JurorLevel from "./JurorLevel";
import JurorTitle from "./JurorTitle";
import Rank from "./Rank";
import Rewards from "./Rewards";
import Score from "./Score";

const Container = styled.div<{ renderRank?: boolean }>`
  ${hoverShortTransitionTiming}
  display: none;
  width: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  align-items: center;
  padding: 15.55px 32px;

  ${({ renderRank }) =>
    landscapeStyle(
      () => css`
        display: grid;
        grid-template-columns: ${renderRank ? `min-content 1fr 0.8fr 1fr 1.6fr 1fr` : `1fr 0.8fr 1fr 1.6fr 1fr`};
        column-gap: ${responsiveSize(12, 24, 900)};
      `
    )}

  :hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }
`;

interface IDesktopCard {
  rank?: number;
  address: string;
  coherenceScore: string;
  totalCoherentVotes: string;
  totalResolvedVotes: string;
}

const DesktopCard: React.FC<IDesktopCard> = ({
  rank,
  address,
  coherenceScore,
  totalCoherentVotes,
  totalResolvedVotes,
}) => {
  const renderRank = !!rank;

  return (
    <Container renderRank={renderRank}>
      {renderRank && <Rank rank={rank} />}
      <JurorTitle address={address} />
      <Score coherenceScore={coherenceScore} />
      <Coherence {...{ totalCoherentVotes, totalResolvedVotes }} />
      <Rewards address={address} />
      <JurorLevel coherenceScore={Number(coherenceScore)} />
    </Container>
  );
};

export default DesktopCard;
