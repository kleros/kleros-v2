import React, { useState } from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import MainStructureTemplate from "./MainStructureTemplate";

export const ParagraphsContainer = styled.div`
  display: flex;
  gap: 18px;
  flex-direction: column;
`;

export const Title = styled.h1`
  margin-bottom: 0;
`;

export const LeftContentContainer = styled.div`
  display: flex;
  gap: 18px;
  flex-direction: column;
`;

export const StyledImage = styled.div`
  width: ${responsiveSize(260, 460)};

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryBlue};
  margin: 0;
  cursor: pointer;
`;

const StyledParagraph = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
`;

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
          <StyledParagraph key={paragraph}>{processNewLineInParagraph(paragraph)}</StyledParagraph>
        ))}
      </ParagraphsContainer>
      {links && links.length > 0 && toggleSubMiniGuide ? (
        <LinksContainer>
          {links.map((link, index) => {
            const isObject = typeof link === "object";
            const linkId = isObject ? link.id : link.split(". ")[1] || link;
            const linkText = isObject ? link.text : link;
            return (
              <StyledLabel key={index} onClick={() => toggleSubMiniGuide(linkId)}>
                {linkText}
              </StyledLabel>
            );
          })}
        </LinksContainer>
      ) : null}
    </LeftContentContainer>
  );
};

const RightContent: React.FC<{ currentPage: number; rightPageComponents: () => React.ReactNode[] }> = ({
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
  rightPageComponents: () => React.ReactNode[];
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
