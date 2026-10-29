import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchIpfsJsonAction } from "../src/dataMappings/actions/fetchIpfsJsonAction";
import { subgraphAction } from "../src/dataMappings/actions/subgraphAction";
import { readJsonWithLimit } from "../src/dataMappings/utils/readJsonWithLimit";
import { MAX_BYTE_SIZE, MAX_SUBGRAPH_RESPONSE_BYTE_SIZE } from "../src/consts";
import { RequestError } from "../src/errors";
import { FetchIpfsJsonMapping, SubgraphMapping } from "../src/dataMappings/utils/actionTypes";

const jsonOfSize = (bytes: number) => JSON.stringify({ pad: "a".repeat(bytes - 10) });

const mockFetch = (body: string, headers: Record<string, string> = {}) =>
  vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(body, { headers: { "content-type": "application/json", ...headers } }));

const ipfsMapping: FetchIpfsJsonMapping = {
  type: "fetch/ipfs/json",
  ipfsUri: "ipfs://QmTest",
  seek: ["name"],
  populate: ["name"],
};

const subgraphMapping: SubgraphMapping = {
  type: "graphql",
  endpoint: "https://example.com/subgraph",
  query: "{ items { id } }",
  variables: {},
  seek: ["items"],
  populate: ["items"],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchIpfsJsonAction response size limit", () => {
  it("returns data under the limit", async () => {
    mockFetch(JSON.stringify({ name: "Alice" }));
    await expect(fetchIpfsJsonAction(ipfsMapping)).resolves.toEqual({ name: "Alice" });
  });

  it("rejects an oversized body without a content-length header", async () => {
    mockFetch(jsonOfSize(MAX_BYTE_SIZE + 1));
    await expect(fetchIpfsJsonAction(ipfsMapping)).rejects.toThrow(RequestError);
  });

  it("rejects an oversized body whose content-length understates it", async () => {
    mockFetch(jsonOfSize(MAX_BYTE_SIZE + 1), { "content-length": "100" });
    await expect(fetchIpfsJsonAction(ipfsMapping)).rejects.toThrow("Response size is too large");
  });
});

describe("subgraphAction response size limit", () => {
  it("returns data under the limit", async () => {
    mockFetch(JSON.stringify({ data: { items: [{ id: "1" }] } }));
    await expect(subgraphAction(subgraphMapping)).resolves.toEqual({ items: [{ id: "1" }] });
  });

  it("rejects an oversized body", async () => {
    mockFetch(jsonOfSize(MAX_SUBGRAPH_RESPONSE_BYTE_SIZE + 1));
    await expect(subgraphAction(subgraphMapping)).rejects.toThrow(RequestError);
  });
});

describe("readJsonWithLimit", () => {
  it("accepts a body exactly at the limit", async () => {
    const body = jsonOfSize(1000);
    await expect(readJsonWithLimit(new Response(body), body.length, "e")).resolves.toEqual(JSON.parse(body));
  });

  it("falls back to json() when the response has no body stream", async () => {
    const response = { body: null, json: async () => ({ ok: true }) } as unknown as Response;
    await expect(readJsonWithLimit(response, 1, "e")).resolves.toEqual({ ok: true });
  });
});
