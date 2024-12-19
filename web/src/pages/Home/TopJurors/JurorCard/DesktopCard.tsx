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

const Container = styled.div`
  ${hoverShortTransitionTiming}
  display: none;
  width: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  align-items: center;
  padding: 15.55px 32px;

  ${landscapeStyle(
    () => css`
      display: grid;
      grid-template-columns:
        min-content repeat(3, ${responsiveSize(160, 180, 900)})
        auto;
      column-gap: ${responsiveSize(12, 28, 900)};
    `
  )}

  :hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }
`;

interface IDesktopCard {
  rank: number;
  address: string;
  totalCoherentVotes: number;
  totalResolvedVotes: number;
  totalResolvedDisputes: number;
  coherenceScore: number;
}

const DesktopCard: React.FC<IDesktopCard> = ({
  rank,
  address,
  totalCoherentVotes,
  totalResolvedVotes,
  totalResolvedDisputes,
  coherenceScore,
}) => {
  return (
    <Container>
      <Rank rank={rank} />
      <JurorTitle address={address} />
      <Rewards address={address} />
      <Coherence {...{ totalCoherentVotes, totalResolvedVotes }} />
      <JurorLevel {...{ coherenceScore, totalResolvedDisputes }} />
    </Container>
  );
};
export default DesktopCard;
