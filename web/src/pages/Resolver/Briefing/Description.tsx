import React, { useRef, useEffect } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import MarkdownEditor from "components/MarkdownEditor";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MarkdownEditorContainer = styled.div`
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const Description: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWrite = (value: string) => {
    setDisputeData({ ...disputeData, description: value });
  };

  useEffect(() => {
    if (containerRef.current) {
      const editorElement = containerRef.current.querySelector('[role="region"]');
      if (editorElement) {
        const contentEditable = editorElement.querySelector('[contenteditable="true"]');
        if (contentEditable) {
          (contentEditable as HTMLElement).focus();
        }
      }
    }
  }, []);

  return (
    <Container ref={containerRef}>
      <Header text={t("headers.describe_the_case")} />
      <MarkdownEditorContainer>
        <MarkdownEditor
          value={disputeData.description}
          onChange={handleWrite}
          placeholder={t("forms.placeholders.bob_hired_alice")}
          showMessage={false}
        />
      </MarkdownEditorContainer>
      <NavigationButtons prevRoute="/resolver/title" nextRoute="/resolver/court" />
    </Container>
  );
};

export default Description;
