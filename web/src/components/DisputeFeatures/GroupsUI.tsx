import React from "react";
import styled from "styled-components";

import { Group } from "consts/disputeFeature";

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
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const SubTitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
  padding: 0;
  margin: 0;
`;

export type GroupUI = (props: { children: JSX.Element }) => JSX.Element;
export const GroupsUI: Record<Group, GroupUI> = {
  [Group.Voting]: ({ children }) => (
    <Container key={Group.Voting}>
      <HeaderContainer>
        <Header>Shielded Voting</Header>
        <SubTitle>This feature hides the jurors votes until the end of the voting period.</SubTitle>
      </HeaderContainer>
      {children}
    </Container>
  ),
  [Group.Eligibility]: ({ children }) => (
    <Container key={Group.Eligibility}>
      <HeaderContainer>
        <Header>Jurors Eligibility</Header>
        <SubTitle>This feature determines who can be selected as a juror.</SubTitle>
      </HeaderContainer>
      {children}
    </Container>
  ),
};
