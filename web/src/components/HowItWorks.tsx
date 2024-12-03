import React from "react";
import styled from "styled-components";

import BookOpenIcon from "svgs/icons/book-open.svg";

const Container = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  gap: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.primaryBlue};
  transition: color 0.1s;

  svg path {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  &:hover {
    color: ${({ theme }) => theme.secondaryBlue};
    svg path {
      transition: fill 0.1s;
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
