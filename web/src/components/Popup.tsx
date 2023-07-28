import React, { useRef } from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import { useFocusOutside } from "hooks/useFocusOutside";
import { Overlay } from "./Overlay";

interface IPopup {
  title: string;
  icon: React.FC<React.SVGAttributes<SVGElement>> | string;
}

const Header = styled.h1`
  display: flex;
  padding-top: 32px;
  padding-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  line-height: 32.68px;
`;

const Icon = styled.svg`
  /* display: flex; */
`;

const StyledButton = styled(Button)`
  margin: 32px 0;
`;

const Container = styled.div`
  display: flex;
  position: absolute;
  max-height: 60vh;
  top: 5%;
  left: 50%;
  transform: translate(-50%);
  z-index: 10;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(300px + (600 - 300) * (100vw - 375px) / (1250 - 375));
  max-width: 600px;
  min-width: 300px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);

  svg {
    visibility: visible;
  }
`;

const Popup: React.FC<IPopup> = ({ title, icon }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => {});

  return (
    <>
      <Overlay />
      <Container ref={containerRef}>
        <Header>{title}</Header>
        {/* {icon && <Icon as={icon} />} */}
        <StyledButton variant="secondary" text="Close" />
      </Container>
    </>
  );
};
export default Popup;
