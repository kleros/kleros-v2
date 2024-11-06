import React from "react";
import styled, { css, keyframes } from "styled-components";

import DottedMenu from "svgs/icons/dotted-menu.svg";

const ripple = keyframes`
     0% {
      opacity: 0;
      transform: scale3d(0.5, 0.5, 1);
    }
     10% {
      opacity: 0.5;
      transform: scale3d(0.75, 0.75, 1);
    }

    100% {
      opacity: 0;
      transform: scale3d(1.75, 1.75, 1);
    }
`;

const ring = (duration: string, delay: string) => css`
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(50%);
  content: "";
  height: 36px;
  width: 36px;
  border: 3px solid ${({ theme }) => theme.primaryBlue};
  border-radius: 100%;
  animation-name: ${ripple};
  animation-duration: ${duration};
  animation-delay: ${delay};
  animation-iteration-count: infinite;
  animation-timing-function: cubic-bezier(0.65, 0, 0.34, 1);
  z-index: 0;
`;

const Container = styled.div<{ displayRipple: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ displayRipple }) =>
    displayRipple &&
    css`
      &::after {
        ${ring("3s", "0s")}
      }
      &::before {
        ${ring("3s", "0.5s")}
      }
    `}
`;

const ButtonContainer = styled.div`
  border-radius: 50%;
  z-index: 1;
  background-color: ${({ theme }) => theme.lightBackground};
`;

const StyledDottedMenu = styled(DottedMenu)`
  cursor: pointer;
  width: 36px;
  height: 36px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

interface IMenuButton {
  toggle: () => void;
  displayRipple: boolean;
}

const MenuButton: React.FC<IMenuButton> = ({ toggle, displayRipple }) => {
  return (
    <Container {...{ displayRipple }}>
      <ButtonContainer>
        <StyledDottedMenu onClick={toggle} />
      </ButtonContainer>
    </Container>
  );
};

export default MenuButton;
