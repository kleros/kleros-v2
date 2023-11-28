import React from "react";
import { landscapeStyle } from "styles/landscapeStyle";
import styled, { css } from "styled-components";
import Rank from "./Rank";
import JurorTitle from "./JurorTitle";
import Rewards from "./Rewards";
import Coherency from "./Coherency";
import JurorLevel from "./JurorLevel";

const Container = styled.div`
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
        min-content repeat(2, calc(80px + (210 - 60) * (min(max(100vw, 375px), 1250px) - 375px) / 875))
        min-content auto;
      column-gap: calc(16px + (28 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
    `
  )}
`;

interface IDesktopCard {
  rank: number;
  address: string;
  totalCoherent: number;
  totalResolvedDisputes: number;
  coherenceScore: number;
}

const DesktopCard: React.FC<IDesktopCard> = ({
  rank,
  address,
  totalCoherent,
  totalResolvedDisputes,
  coherenceScore,
}) => {
  return (
    <Container>
      <Rank rank={rank} />
      <JurorTitle address={address} />
      <Rewards address={address} />
      <Coherency totalCoherent={totalCoherent} totalResolvedDisputes={totalResolvedDisputes} />
      <JurorLevel coherenceScore={coherenceScore} />
    </Container>
  );
};
export default DesktopCard;
