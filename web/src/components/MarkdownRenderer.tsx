import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { isExternalLink } from "utils/linkUtils";
import { isValidUrl } from "utils/urlValidation";

import ExternalLinkWarning from "components/ExternalLinkWarning";

const MarkdownContainer = styled.div`
  font-size: 16px;
  line-height: 1.6;

  *,
  ** {
    font-size: 16px;
  }

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

  pre {
    background-color: ${({ theme }) => theme.lightBackground};
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
  }

  code {
    background-color: ${({ theme }) => theme.lightBackground};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: "Fira Code", monospace;
  }

  pre code {
    background-color: transparent;
    padding: 0;
  }

  blockquote {
    border-left: 4px solid ${({ theme }) => theme.primaryBlue};
    margin: 16px 0;
    padding-left: 16px;
    color: ${({ theme }) => theme.secondaryText};
  }

  ul,
  ol {
    padding-left: 20px;
  }

  input[type="checkbox"] {
    margin-right: 8px;
    margin-top: 4px;
    accent-color: ${({ theme }) => theme.primaryBlue};
    cursor: default;
    vertical-align: top;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${({ theme }) => theme.primaryText};
    margin: 16px 0 8px 0;
    line-height: 1.3;
  }

  h1 {
    font-size: 2em;
    font-weight: 700;
  }

  h2 {
    font-size: 1.5em;
    font-weight: 600;
  }

  h3 {
    font-size: 1.25em;
    font-weight: 600;
  }

  h4 {
    font-size: 1.125em;
    font-weight: 600;
  }

  h5 {
    font-size: 1em;
    font-weight: 600;
  }

  h6 {
    font-size: 0.875em;
    font-weight: 600;
  }

  pre {
    color: ${({ theme }) => theme.primaryText};
  }

  pre code {
    color: inherit;
  }

  code {
    color: ${({ theme }) => theme.primaryText};
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
    border: 1px solid ${({ theme }) => theme.stroke};
  }

  th,
  td {
    border: 1px solid ${({ theme }) => theme.stroke};
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background-color: ${({ theme }) => theme.lightBackground};
    color: ${({ theme }) => theme.primaryText};
    font-weight: 600;
  }

  td {
    color: ${({ theme }) => theme.primaryText};
  }

  tbody tr:nth-child(even) {
    background-color: ${({ theme }) => theme.lightGrey};
  }

  details {
    border: 1px solid ${({ theme }) => theme.stroke};
    border-radius: 8px;
    padding: 8px 12px;
    margin: 16px 0;
    background-color: ${({ theme }) => theme.lightBackground};
  }

  summary {
    font-weight: 600;
    cursor: pointer;
    color: ${({ theme }) => theme.primaryText};
    padding: 4px 0;
    outline: none;
  }

  summary:hover {
    color: ${({ theme }) => theme.primaryBlue};
  }

  details[open] summary {
    margin-bottom: 8px;
    border-bottom: 1px solid ${({ theme }) => theme.stroke};
    padding-bottom: 8px;
  }

  u {
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.primaryText};
  }

  del,
  s {
    text-decoration: line-through;
    text-decoration-color: ${({ theme }) => theme.secondaryText};
  }

  mark {
    background-color: ${({ theme }) => theme.warning};
    color: ${({ theme }) => theme.primaryText};
    padding: 2px 4px;
    border-radius: 2px;
  }

  sub,
  sup {
    font-size: 0.75em;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }

  sup {
    top: -0.5em;
  }

  sub {
    bottom: -0.25em;
  }

  kbd {
    background-color: ${({ theme }) => theme.lightBackground};
    border: 1px solid ${({ theme }) => theme.stroke};
    border-radius: 4px;
    box-shadow: 0 1px 1px ${({ theme }) => theme.stroke};
    color: ${({ theme }) => theme.primaryText};
    font-family: "Fira Code", monospace;
    font-size: 0.875em;
    padding: 2px 6px;
  }

  abbr {
    text-decoration: underline dotted;
    cursor: help;
  }
`;

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
      const target = event.target as HTMLElement;

      if (!container.contains(target)) {
        return;
      }

      const linkElement = target.closest("a") as HTMLAnchorElement | null;

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

    return () => {
      container.removeEventListener("click", handleClick, true);
    };
  }, [handleExternalLink]);

  if (!content || content.trim() === "") {
    return null;
  }

  return (
    <>
      <MarkdownContainer ref={containerRef} className={className} role="region" aria-label="Markdown content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            [
              rehypeSanitize,
              {
                tagNames: [
                  "p",
                  "br",
                  "hr",
                  "h1",
                  "h2",
                  "h3",
                  "h4",
                  "h5",
                  "h6",
                  "ul",
                  "ol",
                  "li",
                  "input",
                  "strong",
                  "b",
                  "em",
                  "i",
                  "u",
                  "del",
                  "s",
                  "mark",
                  "small",
                  "sub",
                  "sup",
                  "code",
                  "pre",
                  "kbd",
                  "samp",
                  "var",
                  "a",
                  "img",
                  "table",
                  "thead",
                  "tbody",
                  "tfoot",
                  "tr",
                  "th",
                  "td",
                  "caption",
                  "blockquote",
                  "div",
                  "span",
                  "section",
                  "article",
                  "aside",
                  "nav",
                  "main",
                  "header",
                  "footer",
                  "details",
                  "summary",
                  "abbr",
                  "cite",
                  "dfn",
                  "time",
                  "address",
                ],
                attributes: {
                  "*": ["className", "id", "style"],
                  a: ["href", "title", "target", "rel"],
                  img: ["src", "alt", "title", "width", "height"],
                  input: ["type", "checked", "disabled"],
                  th: ["scope", "colspan", "rowspan"],
                  td: ["colspan", "rowspan"],
                  details: ["open"],
                  time: ["dateTime"],
                  abbr: ["title"],
                },
              },
            ],
          ]}
          components={{
            a: ({ href, children, ...props }) => {
              return (
                <a href={href} {...props}>
                  {children}
                </a>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </MarkdownContainer>
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
