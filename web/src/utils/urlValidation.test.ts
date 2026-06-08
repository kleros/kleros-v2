import { describe, expect, it } from "vitest";

import { isAllowedAttachmentUrl, isSafeNavigationUrl, isValidUrl, sanitizeHref } from "./urlValidation";

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

describe("isSafeNavigationUrl", () => {
  it("allows https only", () => {
    expect(isSafeNavigationUrl("https://curate.kleros.io")).toBe(true);
    expect(isSafeNavigationUrl("http://example.com")).toBe(false);
    expect(isSafeNavigationUrl("mailto:test@example.com")).toBe(false);
    expect(isSafeNavigationUrl("/cases/1")).toBe(false);
  });
});

describe("isAllowedAttachmentUrl", () => {
  it("allows Kleros CDN IPFS URLs", () => {
    expect(isAllowedAttachmentUrl(SAMPLE_IPFS_URL)).toBe(true);
  });

  it("blocks other origins and paths", () => {
    expect(isAllowedAttachmentUrl("https://example.com/ipfs/QmHash")).toBe(false);
    expect(isAllowedAttachmentUrl(`${GATEWAY_ORIGIN}/not-ipfs/QmHash`)).toBe(false);
    expect(isAllowedAttachmentUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("matches sanitizeHref", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });
});
