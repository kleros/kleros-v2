import React from "react";

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

import { sanitizeMarkdown } from "utils/markdownSanitization";

import { MDXRendererContainer } from "styles/mdxEditorTheme";

import "@mdxeditor/editor/style.css";

interface IMarkdownRenderer {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<IMarkdownRenderer> = ({ content, className }) => {
  if (!content || content.trim() === "") {
    return null;
  }

  const sanitizedContent = sanitizeMarkdown(content);

  const editorProps: MDXEditorProps = {
    markdown: sanitizedContent,
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
    <MDXRendererContainer className={className} role="region" aria-label="Markdown content">
      <MDXEditor {...editorProps} aria-label="Rendered markdown content" />
    </MDXRendererContainer>
  );
};

export default MarkdownRenderer;
