import React, { Dispatch, SetStateAction, useRef } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { CompactPagination } from "@kleros/ui-components-library";
import { Overlay } from "components/Overlay";
import BookOpenIcon from "tsx:assets/svgs/icons/book-open.svg";
import { useFocusOutside } from "hooks/useFocusOutside";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? "flex" : "none")};
  margin: 0 auto;
  z-index: 10;
  position: fixed;
  width: 86vw;
  flex-direction: column;

  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;

  ${landscapeStyle(
    () => css`
      overflow-y: hidden;
      top: 50%;
      width: ${responsiveSize(700, 900)};
      flex-direction: row;
      height: 500px;
    `
  )}
`;

const LeftContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: 86vw;
  padding: ${responsiveSize(24, 32)};
  padding-bottom: 32px;
  background-color: ${({ theme }) => theme.whiteBackground};
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;

  ${landscapeStyle(
    () => css`
      overflow-y: hidden;
      width: ${responsiveSize(350, 450)};
      height: 500px;
    `
  )}
`;

const LeftContainerHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const HowItWorks = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: ${responsiveSize(32, 64)};

  label {
    color: ${({ theme }) => theme.secondaryPurple};
  }
`;

const MobileCompactPagination = styled(CompactPagination)`
  display: flex;
  align-items: flex-start;

  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}
`;

const DesktopCompactPagination = styled(CompactPagination)`
  display: none;
  align-self: end;
  justify-self: end;

  ${landscapeStyle(
    () => css`
      display: block;
    `
  )}
`;

const Close = styled.label`
  display: none;

  ${landscapeStyle(
    () => css`
      display: flex;
      position: absolute;
      top: ${responsiveSize(24, 32)};
      right: 17px;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      cursor: pointer;
      z-index: 11;

      &:hover {
        text-decoration: underline;
      }

      color: ${({ theme }) => theme.primaryBlue};
    `
  )}
`;

const RightContainer = styled.div`
  width: 86vw;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${responsiveSize(24, 32)} 17px;
  background-color: ${({ theme }) => theme.mediumBlue};
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;

  ${landscapeStyle(
    () => css`
      overflow-y: hidden;
      width: ${responsiveSize(350, 450)};
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
  isOnboarding: boolean;
  canClose: boolean;
  isVisible: boolean;
}

const Template: React.FC<ITemplate> = ({
  onClose,
  LeftContent,
  RightContent,
  currentPage,
  setCurrentPage,
  numPages,
  isOnboarding,
  canClose,
  isVisible,
}) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => {
    if (canClose) {
      onClose();
    }
  });
  return (
    <>
      <Overlay />
      <Container ref={containerRef} isVisible={isVisible}>
        <LeftContainer>
          <LeftContainerHeader>
            <HowItWorks>
              <BookOpenIcon />
              <label> {isOnboarding ? "Onboarding" : "How it works"} </label>
            </HowItWorks>
            <MobileCompactPagination
              currentPage={currentPage}
              callback={setCurrentPage}
              numPages={numPages}
              label={`${currentPage}/${numPages}`}
            />
          </LeftContainerHeader>
          {LeftContent}
          <DesktopCompactPagination
            currentPage={currentPage}
            callback={setCurrentPage}
            numPages={numPages}
            label={`${currentPage}/${numPages}`}
          />
        </LeftContainer>
        <RightContainer>
          <Close onClick={onClose}>Close</Close>
          {RightContent}
        </RightContainer>
      </Container>
    </>
  );
};

export default Template;
