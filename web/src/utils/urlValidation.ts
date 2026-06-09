import { sanitizeUrl } from "@braintree/sanitize-url";

import { IPFS_GATEWAY } from "consts/index";

const BLANK_URL = "about:blank";

const getGatewayOrigin = () => new URL(IPFS_GATEWAY).origin;

export const sanitizeHref = (url: string) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  const sanitized = sanitizeUrl(url.trim());
  return sanitized === BLANK_URL ? "" : sanitized;
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

export const isAllowedAttachmentUrl = (url: string) => {
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
