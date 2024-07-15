import React, { useEffect, useRef } from "react";
import styled, { css } from "styled-components";

import { JSONEditor as Editor, JSONEditorPropsOptional } from "vanilla-jsoneditor";

import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 180px);

  --text-color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  --jse-text-readonly: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  --jse-theme-color: ${({ theme }) => theme.klerosUIComponentsPrimaryPurple};
  --jse-background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  --jse-panel-background: ${({ theme }) => theme.klerosUIComponentsHoveredShadow};
  --jse-theme-color-highlight: ${({ theme }) => theme.klerosUIComponentsLightPurple};
  --jse-value-color-string: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  --jse-value-color-number: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue};
  --jse-value-color-null: ${({ theme }) => theme.klerosUIComponentsError};
  --jse-main-border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  --jse-key-color: ${({ theme }) => theme.klerosUIComponentsTint};
  --jse-value-color: ${({ theme }) => theme.klerosUIComponentsSuccess};
  --jse-delimiter-color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  .cm-gutter-lint {
    width: 0.6em;
  }
  ${landscapeStyle(
    () => css`
      width: 30vw;
      height: calc(100vh - 300px);
    `
  )}
`;

const JSONEditor = (props: JSONEditorPropsOptional) => {
  const refContainer = useRef<HTMLDivElement | null>(null);
  const refEditor = useRef<Editor | null>(null);

  useEffect(() => {
    refEditor.current = new Editor({
      target: refContainer.current!,
      props: {
        ...props,
      },
    });

    return () => {
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps(props);
    }
  }, [props]);

  return <Container ref={refContainer}></Container>;
};
export default JSONEditor;
