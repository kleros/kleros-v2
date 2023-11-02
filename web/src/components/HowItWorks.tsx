import React from "react";
import styled from "styled-components";
import BookOpenIcon from "tsx:assets/svgs/icons/book-open.svg";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.primaryBlue};

  &,
  & * {
    cursor: pointer;
  }

  &:hover {
    text-decoration: underline;
  }

  svg {
    path {
      fill: ${({ theme }) => theme.primaryBlue};
    }
  }
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryBlue};
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
        <StyledLabel> How it works </StyledLabel>
      </Container>
      {isMiniGuideOpen && <MiniGuideComponent toggleMiniGuide={toggleMiniGuide} />}
    </>
  );
};

export default HowItWorks;
