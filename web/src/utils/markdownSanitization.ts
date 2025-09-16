import { sanitizeUrl } from "./urlValidation";

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

  sanitized = sanitizeRepeated(sanitized, /<script[^>]*>.*?<\/script>/gis, "");
  sanitized = sanitizeRepeated(sanitized, /<iframe[^>]*>.*?<\/iframe>/gis, "");
  sanitized = sanitizeRepeated(sanitized, /<object[^>]*>.*?<\/object>/gis, "");
  sanitized = sanitizeRepeated(sanitized, /<embed[^>]*\/?>/gi, "");
  sanitized = sanitizeRepeated(sanitized, /<form[^>]*>.*?<\/form>/gis, "");
  sanitized = sanitizeRepeated(sanitized, /<input[^>]*\/?>/gi, "");
  sanitized = sanitizeRepeated(sanitized, /<button[^>]*>.*?<\/button>/gis, "");
  sanitized = sanitizeRepeated(sanitized, /<applet[^>]*>.*?<\/applet>/gis, "");
  sanitized = sanitizeRepeated(sanitized, /<audio[^>]*>.*?<\/audio>/gis, "");
  sanitized = sanitizeRepeated(sanitized, /<video[^>]*>.*?<\/video>/gis, "");
  sanitized = sanitizeRepeated(sanitized, /<svg[^>]*>.*?<\/svg>/gis, "");
  sanitized = sanitizeRepeated(sanitized, /<canvas[^>]*>.*?<\/canvas>/gis, "");

  sanitized = sanitizeRepeated(sanitized, /javascript:/gi, "");
  sanitized = sanitizeRepeated(sanitized, /vbscript:/gi, "");

  sanitized = sanitizeRepeated(sanitized, /on\w+\s*=/gi, "");
  sanitized = sanitizeRepeated(sanitized, /style\s*=/gi, "");

  sanitized = sanitizeRepeated(sanitized, /<meta[^>]*\/?>/gi, "");
  sanitized = sanitizeRepeated(sanitized, /<link[^>]*\/?>/gi, "");
  sanitized = sanitizeRepeated(sanitized, /<base[^>]*\/?>/gi, "");

  sanitized = sanitized.replace(/&#x[0-9a-f]+;/gi, "");
  sanitized = sanitized.replace(/&#[0-9]+;/gi, "");

  return sanitized;
};
