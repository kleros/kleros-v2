import { describe, it, expect } from "vitest";

import { Roles } from "@kleros/kleros-app";

import { Period, type CourtTreeQuery, type Dispute_Filter } from "src/graphql/graphql";

import { findCourtNameById } from "./findCourtNameById";
import { getDescriptiveCourtName } from "./getDescriptiveCourtName";
import { getFormattedPath, getIpfsUrl } from "./getIpfsUrl";
import { getLocalRounds } from "./getLocalRounds";
import { isExternalLink } from "./linkUtils";
import { sanitizeFilter } from "./sanitizeFilter";
import { shortenAddress } from "./shortenAddress";
import { decodeURIFilter, encodeURIFilter } from "./uri";
import { getUserLevelData } from "./userLevelCalculation";

import { getAddressExplorerLink, getFileUploaderMsg, getTxnExplorerLink, isEmpty, isUndefined } from "./index";

describe("isUndefined / isEmpty", () => {
  it.each([
    [undefined, true],
    [null, true],
    [0, false],
    ["", false],
    [false, false],
  ])("isUndefined(%j) = %j", (value, expected) => {
    expect(isUndefined(value)).toBe(expected);
  });

  it.each([
    ["", true],
    ["  \n\t", true],
    [" a ", false],
  ])("isEmpty(%j) = %j", (value, expected) => {
    expect(isEmpty(value)).toBe(expected);
  });
});

describe("explorer links", () => {
  it("point at the default chain explorer (Arbitrum Sepolia on devnet)", () => {
    expect(getTxnExplorerLink("0xabc")).toBe("https://sepolia.arbiscan.io/tx/0xabc");
    expect(getAddressExplorerLink("0x0000000000000000000000000000000000000001")).toBe(
      "https://sepolia.arbiscan.io/address/0x0000000000000000000000000000000000000001"
    );
  });
});

describe("getFileUploaderMsg", () => {
  const restrictions = [
    {
      name: "Evidence",
      restriction: { maxSize: 10 * 1024 * 1024, allowedMimeTypes: ["application/pdf", "image/*", "text"] },
    },
  ];

  it("lists the allowed types and the size limit in MB", () => {
    expect(getFileUploaderMsg(Roles.Evidence, restrictions)).toBe(
      "Allowed file types: [pdf, image, text], Max allowed size: 10.00 MB."
    );
  });

  it("delegates the wording to the translator when given one", () => {
    const t = (key: string, params?: Record<string, string>) => `${key}:${params?.types}:${params?.maxSize}`;
    expect(getFileUploaderMsg(Roles.Evidence, restrictions, t)).toBe(
      "forms.messages.allowed_file_types:pdf, image, text:10.00"
    );
  });

  it("returns undefined when the role has no restriction", () => {
    expect(getFileUploaderMsg(Roles.Evidence)).toBeUndefined();
    expect(getFileUploaderMsg(Roles.Policy, restrictions)).toBeUndefined();
  });
});

describe("getIpfsUrl", () => {
  it.each([
    ["/ipfs/Qm1/file.pdf", "/ipfs/Qm1/file.pdf"],
    ["ipfs/Qm1/file.pdf", "/ipfs/Qm1/file.pdf"],
    ["ipfs://Qm1/file.pdf", "/ipfs/Qm1/file.pdf"],
    ["https://example.com/a", "https://example.com/a"],
  ])("normalizes %j to %j", (input, expected) => {
    expect(getFormattedPath(input)).toBe(expected);
  });

  it("prefixes the configured gateway", () => {
    expect(getIpfsUrl("ipfs://Qm1/file.pdf")).toBe("https://cdn.kleros.link/ipfs/Qm1/file.pdf");
  });
});

describe("shortenAddress", () => {
  it("checksums and keeps the first 6 and last 4 characters", () => {
    expect(shortenAddress("0xabcdef1234567890abcdef1234567890abcdef12")).toBe("0xabCD...eF12");
  });

  it("throws a TypeError for something that is not an address", () => {
    expect(() => shortenAddress("vitalik.eth")).toThrow(TypeError);
  });
});

describe("isExternalLink", () => {
  it.each([
    ["/cases/1", false],
    ["./x", false],
    ["../x", false],
    ["#/courts", false],
    ["mailto:a@b.c", true],
    ["tel:123", true],
    ["https://kleros.io", true],
    [`${window.location.origin}/x`, false],
    ["", false],
  ])("isExternalLink(%j) = %j", (url, expected) => {
    expect(isExternalLink(url)).toBe(expected);
  });
});

describe("sanitizeFilter", () => {
  it("drops empty array filters and collapses an empty result to undefined", () => {
    expect(sanitizeFilter({ period: [], court: "1" })).toEqual({ court: "1" });
    expect(sanitizeFilter({ period: [] })).toBeUndefined();
    expect(sanitizeFilter(undefined)).toBeUndefined();
  });
});

describe("encodeURIFilter / decodeURIFilter", () => {
  it("uses 'all' for an empty filter", () => {
    expect(encodeURIFilter({})).toBe("all");
    expect(decodeURIFilter("all")).toEqual({});
  });

  it("round-trips through the router, which decodes path params before decodeURIFilter sees them", () => {
    const filter: Dispute_Filter = { period: Period.Appeal, court: "12", ruled: false };
    const segment = encodeURIFilter(filter);
    expect(segment).not.toMatch(/[{}":,]/);
    expect(decodeURIFilter(decodeURIComponent(segment))).toEqual(filter);
  });
});

describe("getUserLevelData", () => {
  it.each([
    [0, 0],
    [24, 0],
    [25, 1],
    [69, 2],
    [70, 3],
    [90, 4],
    [100, 4],
    [24.5, 0],
    [150, 0],
  ])("coherence %d is level %d", (score, level) => {
    expect(getUserLevelData(score).level).toBe(level);
  });
});

describe("getDescriptiveCourtName", () => {
  it.each([
    [undefined, ""],
    ["General", "General Court"],
    ["Supreme court", "Supreme court"],
    ["Corte de Consumo", "Corte de Consumo"],
  ])("%j -> %j", (name, expected) => {
    expect(getDescriptiveCourtName(name)).toBe(expected);
  });
});

describe("findCourtNameById", () => {
  const tree = {
    court: {
      id: "1",
      name: "General",
      children: [
        { id: "2", name: "Blockchain", children: [{ id: "4", name: "Non-Technical", children: [] }] },
        { id: "3", name: "Curation", children: [] },
      ],
    },
  } as unknown as CourtTreeQuery;

  it.each([
    ["1", "General"],
    ["4", "Non-Technical"],
    ["3", "Curation"],
    ["99", undefined],
  ])("court %s is %j", (id, expected) => {
    expect(findCourtNameById(tree, id)).toBe(expected);
  });

  it("is undefined before the tree loads", () => {
    expect(findCourtNameById(undefined, "1")).toBeUndefined();
  });
});

describe("getLocalRounds", () => {
  it("flattens local rounds across kit disputes in order", () => {
    expect(getLocalRounds([{ localRounds: [1, 2] }, { localRounds: [3] }])).toEqual([1, 2, 3]);
    expect(getLocalRounds(undefined)).toEqual([]);
    expect(getLocalRounds(null)).toEqual([]);
  });
});
