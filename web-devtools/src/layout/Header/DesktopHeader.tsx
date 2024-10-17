"use-client";
import React from "react";
import styled, { css } from "styled-components";

import KlerosDevtoolsLogo from "svgs/header/devtools-logo.svg";

import { landscapeStyle } from "styles/landscapeStyle";

import Explore from "./navbar/Explore";

const Container = styled.div`
  display: none;
  position: absolute;

  ${landscapeStyle(
    () => css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      position: relative;
    `
  )};
`;

const LeftSide = styled.div`
  display: flex;
`;

const MiddleSide = styled.div`
  display: flex;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: ${({ theme }) => theme.klerosUIComponentsWhite} !important;
`;

const DesktopHeader: React.FC = () => {
  return (
    <>
      <Container>
        <LeftSide>
          <KlerosDevtoolsLogo />
        </LeftSide>
        <MiddleSide>
          <Explore />
        </MiddleSide>
      </Container>
    </>
  );
};
export default DesktopHeader;
