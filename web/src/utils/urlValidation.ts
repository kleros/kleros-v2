import { sanitizeUrl } from "@braintree/sanitize-url";

import { IPFS_GATEWAY } from "consts/index";

const BLANK_URL = "about:blank";

const getGatewayOrigin = (): string => new URL(IPFS_GATEWAY).origin;

export const sanitizeHref = (url: string): string => {
  if (!url || typeof url !== "string") {
    return "";
  }

  const sanitized = sanitizeUrl(url.trim());
  return sanitized === BLANK_URL ? "" : sanitized;
};

export const isValidUrl = (url: string): boolean => {
  return sanitizeHref(url) !== "";
};

export const getSafeNavigationUrl = (url: string) => {
  const safe = sanitizeHref(url);
  if (!safe) {
    return undefined;
  }

  try {
    const parsed = new URL(safe.startsWith("//") ? `https:${safe}` : safe);
    return parsed.protocol === "https:" ? safe : undefined;
  } catch {
    return undefined;
  }
};

export const isSafeNavigationUrl = (url: string) => {
  return getSafeNavigationUrl(url) !== undefined;
};

export const isAllowedAttachmentUrl = (url: string): boolean => {
  const safe = sanitizeHref(url);
  if (!safe) {
    return false;
  }

  try {
    const parsed = new URL(safe);
    return parsed.protocol === "https:" && parsed.origin === getGatewayOrigin() && parsed.pathname.startsWith("/ipfs/");
  } catch {
    return false;
  }
};

const ALLOWED_IMAGE_DATA_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

/** Allowed image MIME types for untrusted data: URIs used as `<img src>`. */
export const isAllowedImageDataUri = (uri: string): boolean => {
  const match = uri.trim().match(/^data:([^;,]+)(;base64)?,/i);
  if (!match) {
    return false;
  }

  return ALLOWED_IMAGE_DATA_TYPES.has(match[1].toLowerCase());
};
