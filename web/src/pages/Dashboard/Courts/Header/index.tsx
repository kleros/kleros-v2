import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import CourtBranch from "./CourtBranch";
import Stake from "./Stake";
import LockedStake from "./LockedStake";

const Container = styled.div`
  display: none;

  ${landscapeStyle(
    () =>
      css`
        display: flex;
        flex-direction: column;
      `
  )}
`;

const CourtBranchAndStakesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  background-color: transparent;
  padding: 24px;
  flex-wrap: wrap;
  padding: 23.15px 32px;
`;

const StakesContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
`;

const Divider = styled.hr`
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: 0;
`;

const Header: React.FC = () => {
  return (
    <>
      <Container>
        <Divider />
        <CourtBranchAndStakesContainer>
          <CourtBranch />
          <StakesContainer>
            <Stake />
            <LockedStake />
          </StakesContainer>
        </CourtBranchAndStakesContainer>
      </Container>
    </>
  );
};

export default Header;
