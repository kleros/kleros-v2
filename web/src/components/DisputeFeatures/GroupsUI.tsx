import React from "react";
import styled from "styled-components";

import { Group } from "consts/disputeFeature";

import LightButton from "../LightButton";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: start;
  padding-bottom: 16px;
`;

const HeaderContainer = styled.div`
  width: 100%;
  padding-top: 16px;
`;

const Header = styled.h2`
  display: flex;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  align-items: center;
  gap: 8px;
`;

const SubTitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
  padding: 0;
  margin: 0;
`;

const StyledLightButton = styled(LightButton)`
  padding: 0 !important;
  .button-text {
    color: ${({ theme }) => theme.primaryBlue};
    font-size: 14px;
  }
  :hover {
    background-color: transparent !important;
    .button-text {
      color: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

export type GroupUI = (props: { children: JSX.Element; clearAll: () => void }) => JSX.Element;
export const GroupsUI: Record<Group, GroupUI> = {
  [Group.Voting]: ({ children, clearAll }) => (
    <Container key={Group.Voting}>
      <HeaderContainer>
        <Header>
          Shielded Voting <StyledLightButton text="Clear" onClick={clearAll} />
        </Header>
        <SubTitle>This feature hides the jurors votes until the end of the voting period.</SubTitle>
      </HeaderContainer>
      {children}
    </Container>
  ),
  [Group.Eligibility]: ({ children, clearAll }) => (
    <Container key={Group.Eligibility}>
      <HeaderContainer>
        <Header>
          Jurors Eligibility <StyledLightButton text="Clear" onClick={clearAll} />
        </Header>
        <SubTitle>This feature determines who can be selected as a juror.</SubTitle>
      </HeaderContainer>
      {children}
    </Container>
  ),
};
