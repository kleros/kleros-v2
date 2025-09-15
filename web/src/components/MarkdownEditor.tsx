import React, { useRef } from "react";
import styled from "styled-components";

import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  ListsToggle,
  CreateLink,
  InsertTable,
  BlockTypeSelect,
  Separator,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

import InfoIcon from "svgs/icons/info-circle.svg";

const Container = styled.div<{ isEmpty: boolean }>`
  width: 100%;

  [class*="mdxeditor-toolbar"] {
    background-color: ${({ theme }) => theme.lightGrey};
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    border-radius: 3px;
    font-family: "Open Sans", sans-serif;

    * svg {
      color: ${({ theme }) => theme.primaryText} !important;
    }

    [class*="selectTrigger"] {
      background-color: ${({ theme }) => theme.whiteBackground} !important;
      color: ${({ theme }) => theme.primaryText} !important;
      cursor: pointer !important;
    }

    button:hover {
      background-color: ${({ theme }) => theme.lightGrey}80 !important;
      cursor: pointer;
    }

    button[data-state="on"],
    button[aria-pressed="true"] {
      background-color: ${({ theme }) => theme.whiteBackground} !important;
    }

    button:disabled,
    button[data-disabled="true"] {
      opacity: 0.4 !important;
      cursor: not-allowed !important;

      svg {
        color: ${({ theme }) => theme.secondaryText} !important;
      }
    }
  }

  [class*="contentEditable"] {
    background-color: ${({ theme }) => theme.whiteBackground} !important;
    border: 1px solid ${({ theme }) => theme.stroke} !important;
    border-radius: 3px;
    color: ${({ theme }) => theme.primaryText} !important;
    min-height: 200px;
    padding: 16px;
    font-size: 16px;
    line-height: 1.5;

    p {
      color: ${({ theme, isEmpty }) => (isEmpty ? theme.secondaryText : theme.primaryText)} !important;
      margin: 0 0 12px 0;
    }

    p:empty::before {
      color: ${({ theme }) => theme.secondaryText} !important;
      opacity: 0.6 !important;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: ${({ theme }) => theme.primaryText} !important;
      font-weight: 600;
      margin: 16px 0 8px 0;
    }

    blockquote {
      color: ${({ theme }) => theme.secondaryText} !important;
      border-left: 3px solid ${({ theme }) => theme.mediumBlue} !important;
      font-style: italic;
      margin: 16px 0;
      padding-left: 12px;
    }

    code {
      background-color: ${({ theme }) => theme.lightGrey} !important;
      color: ${({ theme }) => theme.primaryText} !important;
    }

    pre {
      background-color: ${({ theme }) => theme.lightGrey} !important;
      color: ${({ theme }) => theme.primaryText} !important;
    }

    a {
      color: ${({ theme }) => theme.primaryBlue} !important;
    }

    th {
      background-color: ${({ theme }) => theme.lightGrey} !important;
      color: ${({ theme }) => theme.primaryText} !important;
    }

    td {
      color: ${({ theme }) => theme.primaryText} !important;
    }
  }
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
`;

const MessageText = styled.small`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.secondaryText};
  hyphens: auto;
  line-height: 1.4;
`;

const StyledInfoIcon = styled(InfoIcon)`
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.secondaryText} !important;
  flex-shrink: 0;
  margin-top: 2px;

  path {
    fill: ${({ theme }) => theme.secondaryText} !important;
  }

  * {
    fill: ${({ theme }) => theme.secondaryText} !important;
  }
`;

interface IMarkdownEditor {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showMessage?: boolean;
}

const MarkdownEditor: React.FC<IMarkdownEditor> = ({
  value,
  onChange,
  placeholder = "Justify your vote...",
  showMessage = true,
}) => {
  const editorRef = useRef<MDXEditorMethods>(null);

  const handleChange = (markdown: string) => {
    const cleanedMarkdown = markdown === "\u200B" ? "" : markdown.replace(/^\u200B/, "");
    onChange(cleanedMarkdown);
  };

  const handleContainerClick = () => {
    if (isEmpty && editorRef.current) {
      editorRef.current.setMarkdown("\u200B");
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 0);
    }
  };

  const isEmpty = !value || value.trim() === "";

  const editorProps: MDXEditorProps = {
    markdown: value,
    onChange: handleChange,
    placeholder,
    plugins: [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <UndoRedo />
            <Separator />
            <BoldItalicUnderlineToggles />
            <CodeToggle />
            <Separator />
            <BlockTypeSelect />
            <Separator />
            <ListsToggle />
            <Separator />
            <CreateLink />
            <InsertTable />
          </>
        ),
      }),
    ],
  };

  return (
    <Container isEmpty={isEmpty} onClick={handleContainerClick}>
      <MDXEditor ref={editorRef} {...editorProps} />
      {showMessage && (
        <MessageContainer>
          <StyledInfoIcon />
          <MessageText>
            Please provide a comprehensive justification for your decision. Quality explanations are essential for the
            parties involved and may be eligible for additional compensation in accordance with our justification
            policy.
          </MessageText>
        </MessageContainer>
      )}
    </Container>
  );
};

export default MarkdownEditor;
