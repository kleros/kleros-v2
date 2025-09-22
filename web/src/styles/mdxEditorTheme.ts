import styled, { createGlobalStyle, css } from "styled-components";

const sharedContentStyles = css`
  .mdxeditor-root-contenteditable div {
    padding: 0;
  }

  .mdxeditor-root-contenteditable p {
    color: ${({ theme }) => theme.primaryText} !important;
    margin: 0 0 12px 0;
  }

  .mdxeditor-root-contenteditable h1,
  .mdxeditor-root-contenteditable h2,
  .mdxeditor-root-contenteditable h3,
  .mdxeditor-root-contenteditable h4,
  .mdxeditor-root-contenteditable h5,
  .mdxeditor-root-contenteditable h6 {
    color: ${({ theme }) => theme.primaryText} !important;
    font-weight: 600;
    margin: 16px 0 8px 0;
  }

  .mdxeditor-root-contenteditable blockquote {
    color: ${({ theme }) => theme.primaryText} !important;
    border-left: 3px solid ${({ theme }) => theme.mediumBlue} !important;
    font-style: italic;
    margin: 16px 0;
    padding-left: 12px;
  }

  .mdxeditor-root-contenteditable pre {
    background-color: ${({ theme }) => theme.lightBackground} !important;
    color: ${({ theme }) => theme.primaryText} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    border-radius: 6px !important;
    padding: 12px !important;
    margin: 12px 0 !important;
    font-family: "Fira Code", monospace !important;
    font-size: 14px !important;
  }

  .mdxeditor-root-contenteditable a {
    color: ${({ theme }) => theme.primaryBlue} !important;
  }

  .mdxeditor-root-contenteditable span[class*="_code_"],
  .mdxeditor-root-contenteditable code {
    background-color: ${({ theme }) => theme.lightBackground} !important;
    color: ${({ theme }) => theme.primaryText} !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    font-size: 14px !important;
    font-family: "Fira Code", monospace !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
  }

  .mdxeditor-root-contenteditable th {
    background-color: ${({ theme }) => theme.lightGrey} !important;
    color: ${({ theme }) => theme.primaryText} !important;
  }

  .mdxeditor-root-contenteditable td {
    color: ${({ theme }) => theme.primaryText} !important;
  }
`;

export const MDXEditorContainer = styled.div`
  width: 100%;

  .mdxeditor-toolbar {
    background-color: ${({ theme }) => theme.lightGrey} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    border-radius: 3px;
    font-family: "Open Sans", sans-serif;
  }

  .mdxeditor-toolbar button {
    color: ${({ theme }) => theme.primaryText} !important;
  }

  .mdxeditor-toolbar button:hover {
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    cursor: pointer !important;
  }

  .mdxeditor-toolbar button[data-state="on"],
  .mdxeditor-toolbar button[aria-pressed="true"] {
    background-color: ${({ theme }) => theme.whiteBackground} !important;
  }

  .mdxeditor-toolbar button:disabled,
  .mdxeditor-toolbar button[data-disabled="true"] {
    opacity: 0.4 !important;
    cursor: not-allowed !important;
  }

  .mdxeditor-toolbar button svg {
    color: ${({ theme }) => theme.primaryText} !important;
  }

  .mdxeditor-toolbar button:disabled svg,
  .mdxeditor-toolbar button[data-disabled="true"] svg {
    color: ${({ theme }) => theme.secondaryText} !important;
  }

  .mdxeditor-root-contenteditable {
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    border-radius: 3px;
    color: ${({ theme }) => theme.primaryText} !important;
    height: 220px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
    font-size: 16px;
    line-height: 1.5;
  }

  [class*="placeholder"] {
    color: ${({ theme }) => theme.secondaryText} !important;
    opacity: 0.6 !important;
    margin-top: 16px;
  }

  ${sharedContentStyles}

  [class*="tableColumnEditorPopoverContent"],
  [class*="addRowButton"],
  [class*="addColumnButton"],
  [class*="deleteRowButton"],
  [class*="deleteColumnButton"],
  [class*="tableEditor"],
  [class*="tableToolbar"],
  [class*="tablePopover"] {
    background-color: ${({ theme }) => theme.whiteBackground} !important;

    svg,
    path {
      color: ${({ theme }) => theme.primaryText} !important;
    }
  }
`;

export const MDXEditorGlobalStyles = createGlobalStyle`
  .cm-editor {
    background-color: ${({ theme }) => theme.lightBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    border-radius: 6px !important;
  }

  .cm-content {
    color: ${({ theme }) => theme.primaryText} !important;
    font-family: "Fira Code", monospace !important;
    font-size: 14px !important;
    padding: 12px !important;
  }

  .cm-focused {
    outline: none !important;
  }

  [class*="codeMirrorToolbar"] {
    background-color: transparent !important;
  }

  [class*="cm-gutterElement"] {
    color: ${({ theme }) => theme.secondaryText} !important;
  }

  [class*="codeMirrorWrapper"] {
    border: 1px solid ${({ theme }) => theme.stroke} !important;
  }

  [class*="activeLineGutter"] {
    background-color: transparent !important;
  }

  /* Global styles for all MDXEditor popups and overlays */
  [class*="linkDialogPopoverContent"],
  [class*="selectTrigger"],
  [class*="selectContent"],
  [class*="tableColumnEditorPopoverContent"],
  [class*="tablePopover"],
  [data-radix-popper-content-wrapper] [class*="linkDialog"],
  [data-radix-popper-content-wrapper] [class*="select"],
  [data-radix-popper-content-wrapper] [class*="table"],
  [data-radix-portal] [class*="linkDialog"],
  [data-radix-portal] [class*="select"],
  [data-radix-portal] [class*="table"],
  [data-radix-portal] div[class*="mdx"],
  [data-radix-popper-content-wrapper] div[class*="mdx"] {
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    color: ${({ theme }) => theme.primaryText} !important;

    input,
    select {
      background-color: ${({ theme }) => theme.whiteBackground} !important;
      border: 1px solid ${({ theme }) => theme.stroke} !important;
      color: ${({ theme }) => theme.primaryText} !important;

      &:hover {
        background-color: ${({ theme }) => theme.lightGrey} !important;
      }
    }

    button {
      background-color: ${({ theme }) => theme.lightGrey} !important;
      color: ${({ theme }) => theme.primaryText} !important;
      border: 1px solid ${({ theme }) => theme.stroke} !important;
      cursor: pointer !important;
      transition: background-color 0.2s ease !important;

      &:hover {
        background-color: ${({ theme }) => theme.lightBackground} !important;
      }

      &:active {
        background-color: ${({ theme }) => theme.stroke} !important;
      }
    }

    label,
    span,
    div {
      color: ${({ theme }) => theme.primaryText} !important;
    }

    svg,
    path {
      color: ${({ theme }) => theme.primaryText} !important;
    }
  }

  [class*="mdx"] button,
  [class*="select"] button,
  [class*="trigger"],
  [role="button"],
  [data-radix-portal] [role="button"],
  [data-radix-popper-content-wrapper] [role="button"],
  [data-radix-portal] [data-state],
  [data-radix-popper-content-wrapper] [data-state] {
    cursor: pointer !important;
    transition: all 0.1s ease !important;
    &:hover {
      background-color: ${({ theme }) => theme.lightGrey} !important;
    }
  }
`;
