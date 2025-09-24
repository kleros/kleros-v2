const DANGEROUS_PROTOCOLS = ["javascript:", "vbscript:", "file:", "about:", "blob:", "filesystem:"];

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:", "ftp:"];

const ALLOWED_DATA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

const isValidDataUri = (url: string): boolean => {
  const dataUriRegex = /^data:([^;,]+)(;base64)?,/i;
  const match = url.match(dataUriRegex);

  if (!match) {
    return false;
  }

  const mimeType = match[1].toLowerCase();
  return ALLOWED_DATA_TYPES.includes(mimeType);
};

export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") {
    return false;
  }

  const trimmedUrl = url.trim().toLowerCase();

  if (trimmedUrl.length === 0) {
    return false;
  }

  if (trimmedUrl.startsWith("data:")) {
    return isValidDataUri(trimmedUrl);
  }

  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (trimmedUrl.startsWith(protocol)) {
      return false;
    }
  }

  try {
    const urlObj = new URL(url);
    return ALLOWED_PROTOCOLS.includes(urlObj.protocol);
  } catch {
    return false;
  }
};
