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
        grid-template-columns: ${renderRank
          ? `min-content repeat(3, ${responsiveSize(160, 180, 900)}) auto`
          : `repeat(3, ${responsiveSize(160, 180, 900)}) auto`};
        column-gap: ${responsiveSize(12, 28, 900)};
      `
    )}

  :hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }
`;

interface IDesktopCard {
  rank?: number;
  address: string;
  totalCoherentVotes: string;
  totalResolvedVotes: string;
  totalResolvedDisputes: string;
}

const DesktopCard: React.FC<IDesktopCard> = ({
  rank,
  address,
  totalCoherentVotes,
  totalResolvedVotes,
  totalResolvedDisputes,
}) => {
  const renderRank = !!rank;

  return (
    <Container renderRank={renderRank}>
      {renderRank && <Rank rank={rank} />}
      <JurorTitle address={address} />
      <Rewards address={address} />
      <Coherence {...{ totalCoherentVotes, totalResolvedVotes }} />
      <JurorLevel {...{ totalCoherentVotes, totalResolvedVotes, totalResolvedDisputes }} />
    </Container>
  );
};

export default DesktopCard;
