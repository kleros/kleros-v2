import { describe, it, expect } from "vitest";

import type { CourtTreeQuery } from "src/graphql/graphql";

import { getCourtsPath } from "./index";

describe("getCourtsPath", () => {
  const tree = {
    id: "1",
    name: "General",
    children: [
      { id: "2", name: "Blockchain", children: [{ id: "5", name: "Technical", children: [] }] },
      { id: "3", name: "Curation", children: [] },
    ],
  } as unknown as CourtTreeQuery["court"];

  it("returns the breadcrumb from the root to the court", () => {
    expect(getCourtsPath(tree, "5")).toEqual([
      { id: "1", name: "General" },
      { id: "2", name: "Blockchain" },
      { id: "5", name: "Technical" },
    ]);
    expect(getCourtsPath(tree, "1")).toEqual([{ id: "1", name: "General" }]);
  });

  it("returns null for an unknown court or missing input", () => {
    expect(getCourtsPath(tree, "42")).toBeNull();
    expect(getCourtsPath(tree, undefined)).toBeNull();
    expect(getCourtsPath(null, "1")).toBeNull();
  });
});
