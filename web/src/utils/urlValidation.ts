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

export const isSafeNavigationUrl = (url: string): boolean => {
  const safe = sanitizeHref(url);
  if (!safe) {
    return false;
  }

  try {
    const parsed = new URL(safe.startsWith("//") ? `https:${safe}` : safe);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
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
