import React, { useEffect, useRef } from "react";
import styled, { css } from "styled-components";

import {
  createJSONEditor,
  type JSONEditorPropsOptional,
  type JsonEditor as VanillaJsonEditor,
} from "vanilla-jsoneditor";

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

const JSONEditor = (props: any) => {
  const refContainer = useRef<HTMLDivElement | null>(null);
  const refEditor = useRef<VanillaJsonEditor | null>(null);
  const refPrevProps = useRef<JSONEditorPropsOptional>(props);

  useEffect(() => {
    refEditor.current = createJSONEditor({
      target: refContainer.current as HTMLDivElement,
      props,
    });

    return () => {
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  // update props
  useEffect(() => {
    if (refEditor.current) {
      const changedProps = filterUnchangedProps(props, refPrevProps.current);
      refEditor.current.updateProps(changedProps);
      refPrevProps.current = props;
    }
  }, [props]);

  return <Container ref={refContainer} className={props.className}></Container>;
};

function filterUnchangedProps(
  props: JSONEditorPropsOptional,
  prevProps: JSONEditorPropsOptional
): JSONEditorPropsOptional {
  return Object.fromEntries(
    Object.entries(props).filter(([key, value]) => value !== prevProps[key as keyof JSONEditorPropsOptional])
  );
}

export default JSONEditor;
