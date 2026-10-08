import React, { useState } from "react";

import { cn } from "utils/cn";

import MainStructureTemplate from "./MainStructureTemplate";

export const ParagraphsContainer = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  function ParagraphsContainer({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cn("flex gap-4.5 flex-col", className)} />;
  }
);

export const Title = React.forwardRef<React.ElementRef<"h1">, React.ComponentPropsWithoutRef<"h1">>(function Title(
  { className, ...props },
  ref
) {
  return <h1 {...props} ref={ref} className={cn("mb-0", className)} />;
});

export const LeftContentContainer = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  function LeftContentContainer({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cn("flex gap-4.5 flex-col", className)} />;
  }
);

export const miniGuideImageClassName =
  "w-[calc(260px_+_(460_-_260)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] lg:w-[389px]";

const processNewLineInParagraph = (paragraph: string) => {
  return paragraph.split("\n").map((text, index) => (
    <React.Fragment key={text}>
      {index > 0 && <br />}
      {text}
    </React.Fragment>
  ));
};

const LeftContent: React.FC<{
  currentPage: number;
  leftPageContents: {
    title: string;
    paragraphs: string[];
    links?: Array<string | { id: string; text: string }>;
  }[];
  toggleSubMiniGuide?: (guideName: string) => void;
}> = ({ currentPage, leftPageContents, toggleSubMiniGuide }) => {
  const { title, paragraphs, links } = leftPageContents[currentPage - 1];

  return (
    <LeftContentContainer>
      <Title>{title}</Title>
      <ParagraphsContainer>
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="font-normal text-[14px] leading-[18px] text-klerosUIComponentsSecondaryText m-0"
          >
            {processNewLineInParagraph(paragraph)}
          </p>
        ))}
      </ParagraphsContainer>
      {links && links.length > 0 && toggleSubMiniGuide ? (
        <div className="flex flex-col">
          {links.map((link, index) => {
            const isObject = typeof link === "object";
            const linkId = isObject ? link.id : link.split(". ")[1] || link;
            const linkText = isObject ? link.text : link;
            return (
              <label
                key={index}
                onClick={() => toggleSubMiniGuide(linkId)}
                className="text-klerosUIComponentsPrimaryBlue m-0 cursor-pointer"
              >
                {linkText}
              </label>
            );
          })}
        </div>
      ) : null}
    </LeftContentContainer>
  );
};

const RightContent: React.FC<{ currentPage: number; rightPageComponents: React.FC[] }> = ({
  currentPage,
  rightPageComponents,
}) => {
  const RightPageComponent = rightPageComponents[currentPage - 1];

  return <RightPageComponent />;
};

interface IPageContentsTemplate {
  toggleMiniGuide: () => void;
  toggleSubMiniGuide?: (guideName: string) => void;
  leftPageContents: {
    title: string;
    paragraphs: string[];
    links?: Array<string | { id: string; text: string }>;
  }[];
  rightPageComponents: React.FC[];
  isOnboarding: boolean;
  canClose: boolean;
  isVisible: boolean;
}

const PageContentsTemplate: React.FC<IPageContentsTemplate> = ({
  toggleMiniGuide,
  toggleSubMiniGuide,
  leftPageContents,
  rightPageComponents,
  canClose,
  isVisible,
  isOnboarding,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <MainStructureTemplate
      LeftContent={
        <LeftContent
          currentPage={currentPage}
          leftPageContents={leftPageContents}
          toggleSubMiniGuide={toggleSubMiniGuide}
        />
      }
      RightContent={<RightContent currentPage={currentPage} rightPageComponents={rightPageComponents} />}
      onClose={toggleMiniGuide}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      numPages={leftPageContents.length}
      isOnboarding={isOnboarding}
      canClose={canClose}
      isVisible={isVisible}
    />
  );
};

export default PageContentsTemplate;
