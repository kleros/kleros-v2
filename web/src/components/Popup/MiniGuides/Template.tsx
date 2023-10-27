import React, { Dispatch, SetStateAction } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { CompactPagination } from "@kleros/ui-components-library";
import { Overlay } from "components/Overlay";
import BookOpenIcon from "tsx:assets/svgs/icons/book-open.svg";

const Container = styled.div`
  display: flex;
  margin: 0 auto;
  width: auto;
  z-index: 10;
  position: fixed;
  width: 82vw;
  flex-direction: column;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;

  ${landscapeStyle(
    () => css`
      overflow-y: hidden;
      width: calc(700px + (900 - 700) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      flex-direction: row;
      height: 500px;
    `
  )}
`;

const LeftContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: 82vw;
  min-height: 356px;
  padding: calc(24px + (32 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  background-color: ${({ theme }) => theme.whiteBackground};
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;

  ${landscapeStyle(
    () => css`
      overflow-y: hidden;
      width: calc(350px + (450 - 350) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      height: 500px;
      min-height: auto;
    `
  )}
`;

const HowItWorks = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: calc(32px + (64 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  label {
    color: ${({ theme }) => theme.secondaryPurple};
  }
`;

const StyledCompactPagination = styled(CompactPagination)`
  align-self: end;
  justify-self: end;
`;

const Close = styled.label`
  position: absolute;
  top: calc(24px + (32 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  right: 17px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  cursor: pointer;

  color: ${({ theme }) => theme.primaryBlue};

  ${landscapeStyle(
    () => css`
      z-index: 11;
    `
  )}
`;

const RightContainer = styled.div`
  width: 82vw;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(24px + (32 - 24) * (min(max(100vw, 375px), 1250px) - 375px) / 875) 17px;
  background-color: ${({ theme }) => theme.mediumBlue};
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  height: 800px;

  ${landscapeStyle(
    () => css`
      overflow-y: hidden;
      width: calc(350px + (450 - 350) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      height: 500px;
    `
  )}
`;

interface ITemplate {
  onClose: () => void;
  LeftContent: React.ReactNode;
  RightContent: React.ReactNode;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  numPages: number;
}

const Template: React.FC<ITemplate> = ({
  onClose,
  LeftContent,
  RightContent,
  currentPage,
  setCurrentPage,
  numPages,
}) => {
  return (
    <>
      <Overlay />
      <Container>
        <LeftContainer>
          <HowItWorks>
            <BookOpenIcon />
            <label> How it works </label>
          </HowItWorks>
          <Close onClick={onClose}>Close</Close>
          {LeftContent}
          <StyledCompactPagination
            currentPage={currentPage}
            callback={setCurrentPage}
            numPages={numPages}
            label={`${currentPage}/${numPages}`}
          />
        </LeftContainer>
        <RightContainer>{RightContent}</RightContainer>
      </Container>
    </>
  );
};

export default Template;
