import { describe, expect, it } from "vitest";

import {
  getAllowedAttachmentUrl,
  getSafeNavigationUrl,
  isAllowedImageDataUri,
  isSafeNavigationUrl,
  isValidUrl,
  sanitizeHref,
} from "./urlValidation";

const GATEWAY_ORIGIN = "https://cdn.kleros.link";
const SAMPLE_IPFS_URL = `${GATEWAY_ORIGIN}/ipfs/QmTestHash/file.pdf`;

describe("sanitizeHref", () => {
  it("allows safe URLs", () => {
    expect(sanitizeHref("https://example.com/path")).toBe("https://example.com/path");
    expect(sanitizeHref("mailto:test@example.com")).toBe("mailto:test@example.com");
    expect(sanitizeHref("/cases/1")).toBe("/cases/1");
  });

  it("blocks dangerous URLs", () => {
    expect(sanitizeHref("javascript:alert(1)")).toBe("");
    expect(sanitizeHref("data:text/html,<script>alert(1)</script>")).toBe("");
    expect(sanitizeHref("")).toBe("");
  });
});

describe("getSafeNavigationUrl", () => {
  it("returns sanitized https URLs", () => {
    expect(getSafeNavigationUrl("https://curate.kleros.io")).toBe("https://curate.kleros.io/");
    expect(getSafeNavigationUrl("https://EXAMPLE.COM/path")).toBe("https://example.com/path");
  });

  it("rejects non-https and invalid URLs", () => {
    expect(getSafeNavigationUrl("http://example.com")).toBeUndefined();
    expect(getSafeNavigationUrl("mailto:test@example.com")).toBeUndefined();
    expect(getSafeNavigationUrl("/cases/1")).toBeUndefined();
  });
});

describe("isSafeNavigationUrl", () => {
  it("allows https only", () => {
    expect(isSafeNavigationUrl("https://curate.kleros.io")).toBe(true);
    expect(isSafeNavigationUrl("http://example.com")).toBe(false);
    expect(isSafeNavigationUrl("mailto:test@example.com")).toBe(false);
    expect(isSafeNavigationUrl("/cases/1")).toBe(false);
  });
});

describe("getAllowedAttachmentUrl", () => {
  it("returns Kleros CDN IPFS URLs", () => {
    expect(getAllowedAttachmentUrl(SAMPLE_IPFS_URL)).toBe(SAMPLE_IPFS_URL);
    expect(getAllowedAttachmentUrl(`https://CDN.KLEROS.LINK/ipfs/QmTestHash/file.pdf`)).toBe(SAMPLE_IPFS_URL);
  });

  it("blocks other origins and paths", () => {
    expect(getAllowedAttachmentUrl("https://example.com/ipfs/QmHash")).toBeUndefined();
    expect(getAllowedAttachmentUrl(`${GATEWAY_ORIGIN}/not-ipfs/QmHash`)).toBeUndefined();
    expect(getAllowedAttachmentUrl("javascript:alert(1)")).toBeUndefined();
  });
});

describe("isValidUrl", () => {
  it("matches sanitizeHref", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("isAllowedImageDataUri", () => {
  it("allows image data URIs", () => {
    expect(isAllowedImageDataUri("data:image/png;base64,abc")).toBe(true);
    expect(isAllowedImageDataUri("data:image/svg+xml,<svg></svg>")).toBe(true);
  });

  it("blocks non-image data URIs", () => {
    expect(isAllowedImageDataUri("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isAllowedImageDataUri("https://example.com/image.png")).toBe(false);
  });
});
