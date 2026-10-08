import React, { Dispatch, SetStateAction, useCallback, useRef } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useClickAway } from "react-use";

import { CompactPagination } from "@kleros/ui-components-library";

import BookOpenIcon from "svgs/icons/book-open.svg";

import { cn } from "utils/cn";

import { responsiveSize } from "styles/responsiveSize";

import { Overlay } from "components/Overlay";

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
      <div
        ref={containerRef}
        className={cn(
          "fixed top-[45vh] left-[50vw] z-10 mx-auto max-h-[80vh] w-[86vw] -translate-x-1/2 -translate-y-1/2",
          "flex-col overflow-y-auto lg:top-[50vh] lg:h-[500px] lg:w-[var(--guide-width)] lg:flex-row",
          "lg:overflow-y-hidden",
          isVisible ? "flex" : "hidden"
        )}
        style={{ "--guide-width": responsiveSize(700, 900) } as React.CSSProperties}
      >
        <div
          className={cn(
            "grid w-[86vw] grid-rows-[auto_1fr_auto] rounded-l-[3px] bg-klerosUIComponentsWhiteBackground pb-8",
            "lg:h-[500px] lg:w-[var(--panel-width)] lg:overflow-y-hidden"
          )}
          style={
            {
              padding: responsiveSize(24, 32),
              paddingBottom: 32,
              "--panel-width": responsiveSize(350, 450),
            } as React.CSSProperties
          }
        >
          <div className="flex flex-row justify-between">
            <div
              className={cn(
                "flex items-center gap-2 [&_svg_path]:fill-klerosUIComponentsSecondaryPurple",
                "[&_label]:text-klerosUIComponentsSecondaryPurple"
              )}
              style={{ marginBottom: responsiveSize(32, 64) }}
            >
              <BookOpenIcon />
              <label>{isOnboarding ? t("mini_guides.onboarding") : t("mini_guides.how_it_works")}</label>
            </div>
            <CompactPagination
              className="flex items-start lg:hidden"
              currentPage={currentPage}
              callback={setCurrentPage}
              numPages={numPages}
              onCloseOnLastPage={onCloseAndRemoveOnboardingHashPath}
              label={`${currentPage}/${numPages}`}
            />
          </div>
          {LeftContent}
          <CompactPagination
            className="hidden self-end justify-self-end lg:block"
            currentPage={currentPage}
            callback={setCurrentPage}
            numPages={numPages}
            onCloseOnLastPage={onCloseAndRemoveOnboardingHashPath}
            label={`${currentPage}/${numPages}`}
          />
        </div>
        <div
          className={cn(
            "relative flex w-[86vw] flex-col items-center justify-center rounded-r-[3px]",
            "bg-klerosUIComponentsMediumBlue lg:h-[500px] lg:w-[var(--panel-width)] lg:overflow-y-hidden"
          )}
          style={
            {
              padding: `${responsiveSize(24, 32)} 17px`,
              "--panel-width": responsiveSize(350, 450),
            } as React.CSSProperties
          }
        >
          {RightContent}
        </div>
      </div>
    </Overlay>
  );
};

export default Template;
