import React from "react";
import styled from "styled-components";
import { useToggle } from "react-use";
import BookOpenIcon from "tsx:assets/svgs/icons/book-open.svg";
import Level from "components/Popup/MiniGuides/Level";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  &,
  & * {
    cursor: pointer;
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

const HowItWorks: React.FC = () => {
  const [isLevelMiniGuidesOpen, toggleIsLevelMiniGuidesOpen] = useToggle(false);
  return (
    <>
      <Container onClick={() => toggleIsLevelMiniGuidesOpen()}>
        <BookOpenIcon />
        <StyledLabel> How it works </StyledLabel>
      </Container>
      {isLevelMiniGuidesOpen && <Level {...{ toggleIsLevelMiniGuidesOpen }} />}
    </>
  );
};

export default HowItWorks;
