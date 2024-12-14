import React from "react";
import styled from "styled-components";

import { hoverShortTransitionTiming } from "styles/commonStyles";

import BookOpenIcon from "svgs/icons/book-open.svg";

const Container = styled.div`
  ${hoverShortTransitionTiming}
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  gap: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.primaryBlue};

  svg path {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  &:hover {
    color: ${({ theme }) => theme.secondaryBlue};
    svg path {
      fill: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

interface IHowItWorks {
  isMiniGuideOpen: boolean;
  toggleMiniGuide: () => void;
  MiniGuideComponent: React.ComponentType<{ toggleMiniGuide: () => void }>;
}

const HowItWorks: React.FC<IHowItWorks> = ({ isMiniGuideOpen, toggleMiniGuide, MiniGuideComponent }) => {
  return (
    <>
      <Container onClick={toggleMiniGuide}>
        <BookOpenIcon />
        How it works
      </Container>
      {isMiniGuideOpen && <MiniGuideComponent toggleMiniGuide={toggleMiniGuide} />}
    </>
  );
};

export default HowItWorks;
