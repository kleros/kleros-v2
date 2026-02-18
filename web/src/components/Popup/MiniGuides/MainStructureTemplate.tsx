import React, { Dispatch, SetStateAction, useCallback, useRef } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useClickAway } from "react-use";

import { CompactPagination } from "@kleros/ui-components-library";

import BookOpenIcon from "svgs/icons/book-open.svg";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { Overlay } from "components/Overlay";

const Container = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? "flex" : "none")};
  margin: 0 auto;
  z-index: 10;
  position: fixed;
  width: 86vw;
  flex-direction: column;

  top: 45vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;

  ${landscapeStyle(
    () => css`
      overflow-y: hidden;
      top: 50vh;
      left: 50vw;
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

  svg path {
    fill: ${({ theme }) => theme.secondaryPurple};
  }

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

export const miniGuideHashes = [
  "#jurorlevels-miniguide",
  "#appeal-miniguide",
  "#binaryvoting-miniguide",
  "#disputeresolver-miniguide",
  "#rankedvoting-miniguide",
  "#staking-miniguide",
  "#onboarding-miniguide",
] as const;
export type MiniguideHashesType = (typeof miniGuideHashes)[number];

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
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const removeMiniGuideHashPath = useCallback(() => {
    if (miniGuideHashes.some((hash) => location.hash.includes(hash))) {
      navigate("#", { replace: true });
    }
  }, [location.hash, navigate]);

  const onCloseAndRemoveOnboardingHashPath = () => {
    onClose();
    removeMiniGuideHashPath();
  };

  useClickAway(containerRef, () => {
    if (canClose) {
      onCloseAndRemoveOnboardingHashPath();
    }
  });

  return (
    <Overlay>
      <Container ref={containerRef} isVisible={isVisible}>
        <LeftContainer>
          <LeftContainerHeader>
            <HowItWorks>
              <BookOpenIcon />
              <label>{isOnboarding ? t("mini_guides.onboarding") : t("mini_guides.how_it_works")}</label>
            </HowItWorks>
            <MobileCompactPagination
              currentPage={currentPage}
              callback={setCurrentPage}
              numPages={numPages}
              onCloseOnLastPage={onCloseAndRemoveOnboardingHashPath}
              label={`${currentPage}/${numPages}`}
            />
          </LeftContainerHeader>
          {LeftContent}
          <DesktopCompactPagination
            currentPage={currentPage}
            callback={setCurrentPage}
            numPages={numPages}
            onCloseOnLastPage={onCloseAndRemoveOnboardingHashPath}
            label={`${currentPage}/${numPages}`}
          />
        </LeftContainer>
        <RightContainer>{RightContent}</RightContainer>
      </Container>
    </Overlay>
  );
};

export default Template;
