export const isExternalLink = (url: string): boolean => {
  if (!url || typeof url !== "string") {
    return false;
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.startsWith("/") || trimmedUrl.startsWith("./") || trimmedUrl.startsWith("../")) {
    return false;
  }

  if (trimmedUrl.startsWith("#")) {
    return false;
  }

  if (trimmedUrl.startsWith("mailto:") || trimmedUrl.startsWith("tel:")) {
    return true;
  }

  try {
    const currentOrigin = window.location.origin;
    const linkUrl = new URL(trimmedUrl, currentOrigin);

    return linkUrl.origin !== currentOrigin;
  } catch {
    return true;
  }
};
