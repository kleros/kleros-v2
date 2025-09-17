import { sanitizeUrl } from "./urlValidation";
import DOMPurify from "dompurify";

const sanitizeRepeated = (text: string, pattern: RegExp, replacement: string): string => {
  let result = text;
  let previousResult;
  do {
    previousResult = result;
    result = result.replace(pattern, replacement);
  } while (result !== previousResult);
  return result;
};

export const sanitizeMarkdown = (markdown: string): string => {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  let sanitized = markdown;

  sanitized = sanitized.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, text, url) => {
    const sanitizedUrl = sanitizeUrl(url);
    return `[${text}](${sanitizedUrl})`;
  });

  sanitized = sanitized.replace(/<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, (match, url, text) => {
    const sanitizedUrl = sanitizeUrl(url);
    return `[${text}](${sanitizedUrl})`;
  });

  // Use DOMPurify to sanitize dangerous HTML tags and attributes
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [
      // Allow only safe tags that are valid in Markdown output;
      // Configure to disallow script, iframe, object, embed, form, input, button, applet, audio, video, svg, canvas, meta, link, base
      "b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "blockquote", "code", "pre", "span", "br", "hr", "img"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title"], // No style, no event handlers
    FORBID_TAGS: [
      "script", "iframe", "object", "embed", "form", "input", "button", "applet", "audio", "video", "svg", "canvas", "meta", "link", "base"
    ],
    FORBID_ATTR: [
      "onerror", "onload", "onclick", "style"
    ]
  });

  // Optional: Remove encoded protocols/entities as before
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/vbscript:/gi, "");
  sanitized = sanitized.replace(/data:/gi, "");
  sanitized = sanitized.replace(/&#x[0-9a-f]+;/gi, "");
  sanitized = sanitized.replace(/&#[0-9]+;/gi, "");

  return sanitized;
};
