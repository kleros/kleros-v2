import React, { useEffect, useRef } from "react";
import styled, { css } from "styled-components";

import { JSONEditor as Editor, JSONEditorPropsOptional } from "vanilla-jsoneditor";

import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 180px);

  --text-color: ${({ theme }) => theme.primaryText};
  --jse-text-readonly: ${({ theme }) => theme.primaryText};
  --jse-theme-color: ${({ theme }) => theme.primaryPurple};
  --jse-background-color: ${({ theme }) => theme.whiteBackground};
  --jse-panel-background: ${({ theme }) => theme.hoveredShadow};
  --jse-theme-color-highlight: ${({ theme }) => theme.lightPurple};
  --jse-value-color-string: ${({ theme }) => theme.primaryText};
  --jse-value-color-number: ${({ theme }) => theme.primaryBlue};
  --jse-value-color-null: ${({ theme }) => theme.error};
  --jse-main-border: 1px solid ${({ theme }) => theme.stroke};
  --jse-key-color: ${({ theme }) => theme.tint};
  --jse-value-color: ${({ theme }) => theme.success};
  --jse-delimiter-color: ${({ theme }) => theme.primaryText};
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
  const refContainer = useRef(null);
  const refEditor = useRef<Editor | null>(null);

  useEffect(() => {
    refEditor.current = new Editor({
      target: refContainer.current,
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
