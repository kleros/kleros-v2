import React from "react";
import styled from "styled-components";

import {
  MDXEditor,
  type MDXEditorProps,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  tablePlugin,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

const Container = styled.div`
  width: 100%;

  [class*="mdxeditor"] {
    background: transparent !important;
    border: none !important;
  }

  [class*="toolbar"] {
    display: none !important;
  }

  [class*="contentEditable"] {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    font-size: 16px;
    line-height: 1.5;

    p {
      margin: 0 0 12px 0;
      color: ${({ theme }) => theme.primaryText} !important;
    }

    p:last-child {
      margin-bottom: 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 16px 0 8px 0;
      font-weight: 600;
      color: ${({ theme }) => theme.primaryText} !important;
    }

    h1 {
      font-size: 24px;
    }
    h2 {
      font-size: 20px;
    }
    h3 {
      font-size: 18px;
    }
    h4 {
      font-size: 16px;
    }
    h5 {
      font-size: 14px;
    }
    h6 {
      font-size: 12px;
    }

    ul,
    ol {
      margin: 8px 0;
      padding-left: 24px;
    }

    li {
      margin: 4px 0;
      color: ${({ theme }) => theme.primaryText} !important;
    }

    blockquote {
      border-left: 3px solid ${({ theme }) => theme.mediumBlue} !important;
      padding-left: 12px;
      margin: 16px 0;
      color: ${({ theme }) => theme.secondaryText} !important;
      font-style: italic;
    }

    code {
      background-color: ${({ theme }) => theme.lightGrey} !important;
      color: ${({ theme }) => theme.primaryText} !important;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: "Monaco", "Consolas", monospace;
      font-size: 14px;
    }

    pre {
      background-color: ${({ theme }) => theme.lightGrey} !important;
      color: ${({ theme }) => theme.primaryText} !important;
      padding: 12px;
      border-radius: 3px;
      overflow-x: auto;
      margin: 16px 0;
    }

    pre code {
      background: transparent !important;
      padding: 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }

    th,
    td {
      border: 1px solid ${({ theme }) => theme.stroke} !important;
      padding: 8px 12px;
      text-align: left;
      color: ${({ theme }) => theme.primaryText} !important;
    }

    th {
      background-color: ${({ theme }) => theme.lightGrey} !important;
      font-weight: 600;
    }

    a {
      color: ${({ theme }) => theme.primaryBlue} !important;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
      color: ${({ theme }) => theme.secondaryBlue} !important;
    }

    hr {
      border: none;
      border-top: 1px solid ${({ theme }) => theme.stroke} !important;
      margin: 24px 0;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    * {
      cursor: default !important;
      user-select: text !important;
    }
  }
`;

interface IMarkdownRenderer {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<IMarkdownRenderer> = ({ content, className }) => {
  if (!content || content.trim() === "") {
    return null;
  }

  const editorProps: MDXEditorProps = {
    markdown: content,
    readOnly: true,
    plugins: [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      tablePlugin(),
    ],
  };

  return (
    <Container className={className}>
      <MDXEditor {...editorProps} />
    </Container>
  );
};

export default MarkdownRenderer;
