import React, { useCallback, useEffect, useRef, useState } from "react";
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
  codeBlockPlugin,
} from "@mdxeditor/editor";

import { isExternalLink } from "utils/linkUtils";
import { sanitizeMarkdown } from "utils/markdownSanitization";
import { isValidUrl } from "utils/urlValidation";

import { MDXRendererContainer } from "styles/mdxEditorTheme";

import ExternalLinkWarning from "components/ExternalLinkWarning";

const LinkInterceptorContainer = styled(MDXRendererContainer)`
  a {
    pointer-events: none;
    cursor: pointer;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: auto;
      cursor: pointer;
    }
  }
`;

import "@mdxeditor/editor/style.css";

interface IMarkdownRenderer {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<IMarkdownRenderer> = ({ content, className }) => {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExternalLink = useCallback((url: string) => {
    setPendingUrl(url);
    setIsWarningOpen(true);
  }, []);

  const handleConfirmNavigation = useCallback(() => {
    if (pendingUrl) {
      window.open(pendingUrl, "_blank", "noopener,noreferrer");
    }
    setIsWarningOpen(false);
    setPendingUrl("");
  }, [pendingUrl]);

  const handleCancelNavigation = useCallback(() => {
    setIsWarningOpen(false);
    setPendingUrl("");
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (event: Event) => {
      const linkElement = (event.target as HTMLElement).closest("a") as HTMLAnchorElement | null;

      if (linkElement) {
        const href = linkElement.getAttribute("href") || linkElement.href;
        if (href && isValidUrl(href) && isExternalLink(href)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          handleExternalLink(href);
        }
      }
    };

    container.addEventListener("click", handleClick, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      container.removeEventListener("click", handleClick, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, [handleExternalLink]);

  if (!content || content.trim() === "") {
    return null;
  }

  const sanitizedContent = sanitizeMarkdown(content);

  const editorProps: MDXEditorProps = {
    markdown: sanitizedContent,
    readOnly: true,
    suppressHtmlProcessing: false,
    plugins: [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin({ validateUrl: isValidUrl }),
      tablePlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: "text" }),
    ],
  };

  return (
    <>
      <LinkInterceptorContainer ref={containerRef} className={className} role="region" aria-label="Markdown content">
        <MDXEditor {...editorProps} aria-label="Rendered markdown content" />
      </LinkInterceptorContainer>
      <ExternalLinkWarning
        isOpen={isWarningOpen}
        url={pendingUrl}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </>
  );
};

export default MarkdownRenderer;
