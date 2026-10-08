import React, { useCallback, useEffect, useRef, useState } from "react";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { cn } from "utils/cn";
import { isExternalLink } from "utils/linkUtils";
import { sanitizeHref } from "utils/urlValidation";

import ExternalLinkWarning from "components/ExternalLinkWarning";

interface IMarkdownRenderer {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<IMarkdownRenderer> = ({ content, className }) => {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [pendingOriginalUrl, setPendingOriginalUrl] = useState("");
  const [pendingSanitizedUrl, setPendingSanitizedUrl] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExternalLink = useCallback((originalUrl: string, sanitizedUrl: string) => {
    setPendingOriginalUrl(originalUrl);
    setPendingSanitizedUrl(sanitizedUrl);
    setIsWarningOpen(true);
  }, []);

  const handleConfirmNavigation = useCallback(() => {
    if (pendingSanitizedUrl) {
      window.open(pendingSanitizedUrl, "_blank", "noopener,noreferrer");
    }
    setIsWarningOpen(false);
    setPendingOriginalUrl("");
    setPendingSanitizedUrl("");
  }, [pendingSanitizedUrl]);

  const handleCancelNavigation = useCallback(() => {
    setIsWarningOpen(false);
    setPendingOriginalUrl("");
    setPendingSanitizedUrl("");
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
        const originalUrl = linkElement.getAttribute("href") || linkElement.href;
        const sanitizedUrl = originalUrl ? sanitizeHref(originalUrl) : "";
        if (sanitizedUrl && isExternalLink(originalUrl)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          handleExternalLink(originalUrl, sanitizedUrl);
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
      <div
        ref={containerRef}
        role="region"
        aria-label="Markdown content"
        className={cn(
          "text-[16px] leading-[1.6] [&_p]:m-[1em_0] [&_ul]:m-[1em_0]",
          "[&_ol]:m-[1em_0] [&_pre]:m-[1em_0] [&_li_>_ul]:m-0 [&_li_>_ol]:m-0 [&_hr]:m-[0.5em_0]",
          "[&_ul]:[list-style:disc] [&_ol]:[list-style:decimal] [&_a]:pointer-events-none [&_a]:cursor-pointer",
          '[&_a]:relative [&_a::after]:[content:""] [&_a::after]:absolute [&_a::after]:top-0 [&_a::after]:left-0',
          "[&_a::after]:w-full [&_a::after]:h-full [&_a::after]:[pointer-events:auto]",
          "[&_a::after]:cursor-pointer [&_pre]:bg-klerosUIComponentsLightBackground [&_pre]:rounded-[8px]",
          "[&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:bg-klerosUIComponentsLightBackground",
          '[&_code]:p-[2px_4px] [&_code]:rounded-[4px] [&_code]:[font-family:"Fira_Code",_monospace]',
          "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
          "[&_blockquote]:[border-left:4px_solid_var(--klerosUIComponentsPrimaryBlue)] [&_blockquote]:m-[16px_0]",
          "[&_blockquote]:pl-4 [&_blockquote]:text-klerosUIComponentsSecondaryText [&_ul]:pl-5 [&_ol]:pl-5",
          '[&_input[type="checkbox"]]:mr-2 [&_input[type="checkbox"]]:mt-1',
          '[&_input[type="checkbox"]]:[accent-color:var(--klerosUIComponentsPrimaryBlue)]',
          '[&_input[type="checkbox"]]:cursor-default [&_input[type="checkbox"]]:[vertical-align:top]',
          "[&_h1]:text-klerosUIComponentsPrimaryText [&_h1]:m-[16px_0_8px_0]",
          "[&_h2]:text-klerosUIComponentsPrimaryText [&_h2]:m-[16px_0_8px_0]",
          "[&_h3]:text-klerosUIComponentsPrimaryText [&_h3]:m-[16px_0_8px_0]",
          "[&_h4]:text-klerosUIComponentsPrimaryText [&_h4]:m-[16px_0_8px_0]",
          "[&_h5]:text-klerosUIComponentsPrimaryText [&_h5]:m-[16px_0_8px_0]",
          "[&_h6]:text-klerosUIComponentsPrimaryText [&_h6]:m-[16px_0_8px_0]",
          "[&_h1]:text-[2em]/[1.3] [&_h1]:font-bold [&_h2]:text-[1.5em]/[1.3] [&_h2]:font-semibold [&_h3]:text-[1.25em]/[1.3]",
          "[&_h3]:font-semibold [&_h4]:text-[1.125em]/[1.3] [&_h4]:font-semibold [&_h5]:text-[1em]/[1.3]",
          "[&_h5]:font-semibold [&_h6]:text-[0.875em]/[1.3] [&_h6]:font-semibold",
          "[&_pre]:text-klerosUIComponentsPrimaryText [&_pre_code]:text-inherit",
          "[&_code]:text-klerosUIComponentsPrimaryText [&_table]:[border-collapse:collapse] [&_table]:w-full",
          "[&_table]:m-[16px_0] [&_table]:border [&_table]:border-solid [&_table]:border-klerosUIComponentsStroke",
          "[&_th]:border [&_th]:border-solid [&_th]:border-klerosUIComponentsStroke [&_th]:p-[8px_12px] [&_th]:text-left",
          "[&_td]:border [&_td]:border-solid [&_td]:border-klerosUIComponentsStroke [&_td]:p-[8px_12px] [&_td]:text-left",
          "[&_th]:bg-klerosUIComponentsLightBackground [&_th]:text-klerosUIComponentsPrimaryText",
          "[&_th]:font-semibold [&_td]:text-klerosUIComponentsPrimaryText",
          "[&_tbody_tr:nth-child(even)]:bg-klerosUIComponentsLightGrey",
          "[&_details]:border [&_details]:border-solid [&_details]:border-klerosUIComponentsStroke [&_details]:rounded-[8px]",
          "[&_details]:p-[8px_12px] [&_details]:m-[16px_0] [&_details]:bg-klerosUIComponentsLightBackground",
          "[&_summary]:font-semibold [&_summary]:cursor-pointer [&_summary]:text-klerosUIComponentsPrimaryText",
          "[&_summary]:p-[4px_0] [&_summary]:outline-none [&_summary:hover]:text-klerosUIComponentsPrimaryBlue",
          "[&_details[open]_summary]:mb-2",
          "[&_details[open]_summary]:[border-bottom:1px_solid_var(--klerosUIComponentsStroke)]",
          "[&_details[open]_summary]:pb-2 [&_u]:underline",
          "[&_u]:[text-decoration-color:var(--klerosUIComponentsPrimaryText)]",
          "[&_del]:line-through",
          "[&_del]:[text-decoration-color:var(--klerosUIComponentsSecondaryText)]",
          "[&_s]:line-through",
          "[&_s]:[text-decoration-color:var(--klerosUIComponentsSecondaryText)]",
          "[&_mark]:bg-klerosUIComponentsWarning [&_mark]:text-klerosUIComponentsPrimaryText",
          "[&_mark]:p-[2px_4px] [&_mark]:rounded-[2px] [&_sub]:text-[0.75em] [&_sub]:leading-0 [&_sub]:relative",
          "[&_sub]:[vertical-align:baseline] [&_sup]:text-[0.75em] [&_sup]:leading-0 [&_sup]:relative",
          "[&_sup]:[vertical-align:baseline] [&_sup]:top-[-0.5em] [&_sub]:bottom-[-0.25em]",
          "[&_kbd]:bg-klerosUIComponentsLightBackground",
          "[&_kbd]:border [&_kbd]:border-solid [&_kbd]:border-klerosUIComponentsStroke [&_kbd]:rounded-[4px]",
          "[&_kbd]:[box-shadow:0_1px_1px_var(--klerosUIComponentsStroke)]",
          '[&_kbd]:text-klerosUIComponentsPrimaryText [&_kbd]:[font-family:"Fira_Code",_monospace]',
          "[&_kbd]:text-[0.875em] [&_kbd]:p-[2px_6px] [&_abbr]:[text-decoration:underline_dotted]",
          "[&_abbr]:[cursor:help]",
          className
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            //@ts-expect-error rehype-raw and react-markdown Pluggable type seem to mismatch, but runtime is correct.
            rehypeRaw,
            [
              rehypeSanitize,
              {
                ...defaultSchema,
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
                  ...(defaultSchema?.attributes ?? {}),
                  a: ["href", "title", "target", "rel"],
                  img: ["src", "alt", "title", "width", "height"],
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
      </div>
      <ExternalLinkWarning
        isOpen={isWarningOpen}
        sanitizedUrl={pendingSanitizedUrl}
        originalUrl={pendingOriginalUrl}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </>
  );
};

export default MarkdownRenderer;
