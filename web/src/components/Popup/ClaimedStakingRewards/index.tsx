import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useFocusOutside } from "hooks/useFocusOutside";
import { Overlay } from "components/Overlay";
import KlerosIcon from "./KlerosIcon";
import ClaimedText from "./ClaimedText";
import QuantityClaimed from "./QuantityClaimed";
import Divider from "./Divider";
import ThanksText from "./ThanksText";
import ReadMore from "./ReadMore";
import Close from "./Close";

const Container = styled.div`
  display: flex;
  position: relative;
  width: 86vw;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.whiteBackground};
  padding: calc(24px + (52 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-top: calc(24px + (48 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;
  z-index: 10;

  ${landscapeStyle(
    () => css`
      width: calc(300px + (862 - 300) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
    `
  )}
`;

interface IClaimedStakingRewards {
  toggleIsOpen: () => void;
}

const ClaimedStakingRewards: React.FC<IClaimedStakingRewards> = ({ toggleIsOpen }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => toggleIsOpen());

  return (
    <>
      <Overlay />
      <Container ref={containerRef}>
        <KlerosIcon />
        <ClaimedText />
        <QuantityClaimed />
        <Divider />
        <ThanksText />
        <ReadMore />
        <Close togglePopup={toggleIsOpen} />
      </Container>
    </>
  );
};

export default ClaimedStakingRewards;
