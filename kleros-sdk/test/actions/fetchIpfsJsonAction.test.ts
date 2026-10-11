import { afterEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { fetchIpfsJsonAction } from "../../src/dataMappings/actions/fetchIpfsJsonAction";
import { FetchIpfsJsonMapping } from "../../src/dataMappings/utils/actionTypes";
import { MAX_BYTE_SIZE } from "../../src/consts";
import { RequestError } from "../../src/errors";
import { server } from "../msw/server";

const CID = "QmQ2XoA25HmnPUEWDduxj6LYwMwp6jtXPFRMHcNF2EvJfU";
const GATEWAY_URL = `https://ipfs.io/ipfs/${CID}/file.json`;

const mapping = (ipfsUri: string): FetchIpfsJsonMapping => ({
  type: "fetch/ipfs/json",
  ipfsUri,
  seek: ["name", "nested.lastName"],
  populate: ["name", "lastName"],
});

const serveJson = (body: Record<string, unknown>, init?: ResponseInit) => {
  const requested: string[] = [];
  server.use(
    http.get("https://ipfs.io/ipfs/*", ({ request }) => {
      requested.push(request.url);
      return HttpResponse.json(body, init);
    })
  );
  return requested;
};

describe("fetchIpfsJsonAction", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    { form: "/ipfs/ path", uri: `/ipfs/${CID}/file.json` },
    { form: "ipfs:// URI", uri: `ipfs://${CID}/file.json` },
    { form: "bare CID path", uri: `${CID}/file.json` },
  ])("resolves a $form through the ipfs.io gateway", async ({ uri }) => {
    const requested = serveJson({ name: "Mezozoic", nested: { lastName: "Camargo" } });

    const result = await fetchIpfsJsonAction(mapping(uri));

    expect(requested).toEqual([GATEWAY_URL]);
    expect(result).toEqual({ name: "Mezozoic", lastName: "Camargo" });
  });

  it.each(["https://example.com/file.json", "http://127.0.0.1/file.json"])("rejects the http URI %s", async (uri) => {
    await expect(fetchIpfsJsonAction(mapping(uri))).rejects.toThrow(
      expect.objectContaining({ name: "RequestError", message: "Invalid IPFS URI format" })
    );
  });

  it("rejects a non-ok gateway response with the gateway URL", async () => {
    serveJson({ error: "not found" }, { status: 404 });

    const error = await fetchIpfsJsonAction(mapping(`/ipfs/${CID}/file.json`)).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RequestError);
    expect(error).toMatchObject({ message: "Failed to fetch data from IPFS", endpoint: GATEWAY_URL });
  });

  it("rejects when content-length exceeds the byte cap", async () => {
    serveJson({ name: "x" }, { headers: { "content-length": String(MAX_BYTE_SIZE + 1) } });

    await expect(fetchIpfsJsonAction(mapping(`/ipfs/${CID}/file.json`))).rejects.toThrow("Response size is too large");
  });

  it("rejects a response that is not application/json", async () => {
    server.use(http.get("https://ipfs.io/ipfs/*", () => HttpResponse.text('{"name":"x"}')));

    await expect(fetchIpfsJsonAction(mapping(`/ipfs/${CID}/file.json`))).rejects.toThrow("Fetched data is not JSON");
  });

  // issue: 2026-10-09-kleros-v2-dev-mapping-timeouts-caps
  it.fails("KNOWN BUG: an oversized body without content-length is rejected", async () => {
    const oversized = JSON.stringify({ name: "x".repeat(MAX_BYTE_SIZE + 1) });
    server.use(
      http.get(
        "https://ipfs.io/ipfs/*",
        () =>
          new HttpResponse(
            new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode(oversized));
                controller.close();
              },
            }),
            { headers: { "content-type": "application/json" } }
          )
      )
    );

    await expect(fetchIpfsJsonAction(mapping(`/ipfs/${CID}/file.json`))).rejects.toThrow();
  });

  // issue: 2026-10-09-kleros-v2-dev-mapping-timeouts-caps
  it.fails("KNOWN BUG: a never-responding gateway rejects within 60 s", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    server.use(http.get("https://ipfs.io/ipfs/*", () => new Promise<never>(() => {})));

    const settled = vi.fn();
    fetchIpfsJsonAction(mapping(`/ipfs/${CID}/file.json`)).then(settled, settled);
    await vi.advanceTimersByTimeAsync(60_000);

    expect(settled).toHaveBeenCalled();
  });
});
