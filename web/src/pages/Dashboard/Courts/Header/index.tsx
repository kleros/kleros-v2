import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import CourtBranch from "./CourtBranch";
import Stake from "./Stake";
import LockedStake from "./LockedStake";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  background-color: transparent;
  padding: 24px;
  flex-wrap: wrap;

  ${landscapeStyle(
    () =>
      css`
        flex-wrap: nowrap;
        gap: 0px;
        padding: 23.15px 32px;
      `
  )}
`;

const StakesContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  ${landscapeStyle(
    () =>
      css`
        gap: 32px;
      `
  )}
`;

const Header: React.FC = () => {
  return (
    <Container>
      <CourtBranch />
      <StakesContainer>
        <Stake />
        <LockedStake />
      </StakesContainer>
    </Container>
  );
};

export default Header;
