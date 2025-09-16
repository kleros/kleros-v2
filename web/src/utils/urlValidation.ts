const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:", "about:"];

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:", "ftp:"];

export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") {
    return false;
  }

  const trimmedUrl = url.trim().toLowerCase();

  if (trimmedUrl.length === 0) {
    return false;
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

export const sanitizeUrl = (url: string): string => {
  if (!isValidUrl(url)) {
    return "#";
  }
  return url;
};
