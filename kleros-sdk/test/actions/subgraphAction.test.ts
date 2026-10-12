import { afterEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { subgraphAction } from "../../src/dataMappings/actions/subgraphAction";
import { SubgraphMapping } from "../../src/dataMappings/utils/actionTypes";
import { server } from "../msw/server";

const ENDPOINT = "https://api.studio.thegraph.com/query/1/escrow/v1";

const mapping = (overrides: Partial<SubgraphMapping> = {}): SubgraphMapping => ({
  type: "graphql",
  endpoint: ENDPOINT,
  query: "query GetEscrow($id: ID!) { escrow(id: $id) { buyer amount } escrows { id } }",
  variables: { id: "7" },
  seek: ["escrow.buyer", "escrow.amount", "escrows[1].id"],
  populate: ["buyer", "amount", "secondEscrowId"],
  ...overrides,
});

describe("subgraphAction", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("posts the query and variables as JSON and maps nested and indexed paths", async () => {
    let received: { body: unknown; contentType: string | null; accept: string | null } | undefined;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        received = {
          body: await request.json(),
          contentType: request.headers.get("content-type"),
          accept: request.headers.get("accept"),
        };
        return HttpResponse.json({
          data: { escrow: { buyer: "0xabc", amount: "1000" }, escrows: [{ id: "1" }, { id: "2" }] },
        });
      })
    );

    const result = await subgraphAction(mapping());

    expect(received).toEqual({
      body: { query: mapping().query, variables: { id: "7" } },
      contentType: "application/json",
      accept: "application/json",
    });
    expect(result).toEqual({ buyer: "0xabc", amount: "1000", secondEscrowId: "2" });
  });

  it("omits keys whose path is missing from the response", async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.json({ data: { escrow: null, escrows: [] } })));

    expect(await subgraphAction(mapping())).toEqual({});
  });

  it("returns an empty result when the response carries only GraphQL errors", async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.json({ errors: [{ message: "bad query" }] })));

    expect(await subgraphAction(mapping())).toEqual({});
  });

  it("rejects when the body is not JSON", async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.text("<html>gateway error</html>", { status: 502 })));

    await expect(subgraphAction(mapping())).rejects.toThrow(SyntaxError);
  });

  // issue: 2026-10-09-kleros-v2-dev-mapping-timeouts-caps
  it.fails("KNOWN BUG: a never-responding endpoint rejects within 60 s", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    server.use(http.post(ENDPOINT, () => new Promise<never>(() => {})));

    const settled = vi.fn();
    subgraphAction(mapping()).then(settled, settled);
    await vi.advanceTimersByTimeAsync(60_000);

    expect(settled).toHaveBeenCalled();
  });
});
