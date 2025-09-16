import { sanitizeUrl } from "./urlValidation";

export const sanitizeMarkdown = (markdown: string): string => {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  return markdown
    .replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, text, url) => {
      const sanitizedUrl = sanitizeUrl(url);
      return `[${text}](${sanitizedUrl})`;
    })
    .replace(/<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, (match, url, text) => {
      const sanitizedUrl = sanitizeUrl(url);
      return `[${text}](${sanitizedUrl})`;
    })
    .replace(/<script[^>]*>.*?<\/script>/gis, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, "")
    .replace(/<object[^>]*>.*?<\/object>/gis, "")
    .replace(/<embed[^>]*\/?>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/on\w+\s*=/gi, "");
};
