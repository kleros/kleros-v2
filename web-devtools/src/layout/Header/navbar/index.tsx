"use client";
import React from "react";
import styled from "styled-components";

import { useLockBodyScroll } from "react-use";

import { useOpenContext } from "../MobileHeader";

import Explore from "./Explore";

const Wrapper = styled.div<{ isOpen: boolean }>`
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  position: absolute;
  top: 100%;
  left: 0;
  width: 100vw;
  z-index: 30;
`;

const Container = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  z-index: 1;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  box-shadow: 0px 2px 3px ${({ theme }) => theme.klerosUIComponentsDefaultShadow};
  transform-origin: top;
  transform: scaleY(${({ isOpen }) => (isOpen ? "1" : "0")});
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition-property: transform, visibility;
  transition-duration: ${({ theme }) => theme.klerosUIComponentsTransitionSpeed};
  transition-timing-function: ease;
  padding: 24px;

  hr {
    margin: 24px 0;
  }
`;

const NavBar: React.FC = () => {
  const { isOpen } = useOpenContext();
  useLockBodyScroll(isOpen);

  return (
    <>
      <Wrapper {...{ isOpen }}>
        <Container {...{ isOpen }}>
          <Explore />
        </Container>
      </Wrapper>
    </>
  );
};

export default NavBar;
