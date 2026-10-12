import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { executeAction, executeActions } from "../src";
import { ActionMapping } from "../src/dataMappings/utils/actionTypes";
import { InvalidContextError, InvalidMappingError, UnsupportedActionError } from "../src/errors";
import { server } from "./msw/server";
import { mockChain } from "./helpers/rpc";
import { newQuestionLog, newTemplateLog, QUESTION_ID, REALITY_PROXY } from "./fixtures/reality";

const json = (value: object, seek: string[], populate: string[]) =>
  ({ type: "json", value, seek, populate }) as ActionMapping;

describe("executeAction", () => {
  it("renders placeholders from the context before running the action", async () => {
    const result = await executeAction(json({ greeting: "hello {{name}}" }, ["greeting"], ["out"]), { name: "juror" });

    expect(result).toEqual({ out: "hello juror" });
  });

  it("throws InvalidContextError when a placeholder is not in the context", async () => {
    await expect(executeAction(json({ v: "{{absent}}" }, ["v"], ["v"]), {})).rejects.toThrow(InvalidContextError);
  });

  it("throws UnsupportedActionError for an unknown type", async () => {
    const mapping = { type: "fetch/ipfsJson", seek: [], populate: [] } as unknown as ActionMapping;

    await expect(executeAction(mapping)).rejects.toThrow(UnsupportedActionError);
  });

  it.each([
    { type: "graphql", missing: "endpoint" },
    { type: "json", missing: "value" },
    { type: "abi/call", missing: "abi" },
    { type: "abi/event", missing: "eventFilter", extra: { abi: "event E()" } },
    { type: "fetch/ipfs/json", missing: "ipfsUri" },
  ])("throws InvalidMappingError when $type lacks $missing", async ({ type, missing, extra }) => {
    const mapping = { type, seek: [], populate: [], ...extra } as unknown as ActionMapping;

    await expect(executeAction(mapping)).rejects.toThrow(new InvalidMappingError(`${missing} is required for ${type}`));
  });

  it("throws InvalidMappingError when realityQuestionID is not a string", async () => {
    const mapping = { type: "reality", realityQuestionID: 1, seek: [], populate: [] } as unknown as ActionMapping;

    await expect(executeAction(mapping, { arbitrableAddress: REALITY_PROXY })).rejects.toThrow(InvalidMappingError);
  });

  it("runs a reality mapping against the arbitrableAddress in the context", async () => {
    const chain = mockChain({ logs: [newQuestionLog(), newTemplateLog(0)] });
    const mapping = { type: "reality", realityQuestionID: "{{qid}}", seek: [], populate: [] } as ActionMapping;

    const result = await executeAction(mapping, { qid: QUESTION_ID, arbitrableAddress: REALITY_PROXY });

    expect(result).toMatchObject({ questionId: QUESTION_ID, type: "bool" });
    expect(chain.filters().every((f) => f.address === REALITY_PROXY)).toBe(true);
  });

  it("rejects a reality mapping when the context has no arbitrableAddress", async () => {
    const mapping = { type: "reality", realityQuestionID: QUESTION_ID, seek: [], populate: [] } as ActionMapping;

    await expect(executeAction(mapping, {})).rejects.toThrow(InvalidContextError);
  });
});

describe("executeActions", () => {
  it("feeds each mapping's output into the next mapping's context", async () => {
    const endpoint = "https://api.studio.thegraph.com/query/1/escrow/v1";
    let variables: unknown;
    server.use(
      http.post(endpoint, async ({ request }) => {
        variables = ((await request.json()) as { variables: unknown }).variables;
        return HttpResponse.json({ data: { escrow: { buyer: "0xb" } } });
      })
    );

    const context = await executeActions(
      [
        json({ id: "42" }, ["id"], ["escrowId"]),
        {
          type: "graphql",
          endpoint,
          query: "query($id: ID!) { escrow(id: $id) { buyer } }",
          variables: { id: "{{escrowId}}" },
          seek: ["escrow.buyer"],
          populate: ["buyer"],
        },
      ],
      { disputeId: "1" }
    );

    expect(variables).toEqual({ id: "42" });
    expect(context).toEqual({ disputeId: "1", escrowId: "42", buyer: "0xb" });
  });

  it("lets a later mapping overwrite a key set by an earlier mapping", async () => {
    const context = await executeActions([json({ v: "first" }, ["v"], ["k"]), json({ v: "second" }, ["v"], ["k"])]);

    expect(context).toEqual({ k: "second" });
  });

  it("does not mutate the initial context", async () => {
    const initial = { a: 1 };

    await executeActions([json({ v: 2 }, ["v"], ["b"])], initial);

    expect(initial).toEqual({ a: 1 });
  });

  it("does not pollute Object.prototype through populate", async () => {
    await executeActions([json({ v: { polluted: true } }, ["v"], ["__proto__"])]);

    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  describe("sdk-populate-strict", () => {
    // issue: 2026-10-09-kleros-v2-dev-sdk-populate-strict
    it.fails("KNOWN BUG: a mapping cannot overwrite an initial context key", async () => {
      const context = await executeActions([json({ a: "0xdead" }, ["a"], ["arbitrableAddress"])], {
        arbitrableAddress: REALITY_PROXY,
      });

      expect(context.arbitrableAddress).toBe(REALITY_PROXY);
    });

    // issue: 2026-10-09-kleros-v2-dev-sdk-populate-strict
    it.fails("KNOWN BUG: the reality action reads the initial arbitrableAddress", async () => {
      const chain = mockChain({ logs: [newQuestionLog(), newTemplateLog(0)] });
      const forged = "0x000000000000000000000000000000000000dEaD";

      await executeActions(
        [
          json({ a: forged }, ["a"], ["arbitrableAddress"]),
          { type: "reality", realityQuestionID: QUESTION_ID, seek: [], populate: [] } as ActionMapping,
        ],
        { arbitrableAddress: REALITY_PROXY }
      ).catch(() => undefined);

      expect(chain.filters().map((f) => f.address)).not.toContain(forged);
    });
  });

  describe("mapping-endpoint-allowlist", () => {
    // issue: 2026-10-09-kleros-v2-dev-mapping-endpoint-allowlist
    it.fails("KNOWN BUG: a graphql mapping to a non-allowlisted endpoint throws", async () => {
      server.use(http.post("http://127.0.0.1:8545/graphql", () => HttpResponse.json({ data: { q: "attacker" } })));

      await expect(
        executeActions([
          {
            type: "graphql",
            endpoint: "http://127.0.0.1:8545/graphql",
            query: "{ q }",
            variables: {},
            seek: ["q"],
            populate: ["q"],
          },
        ])
      ).rejects.toThrow();
    });

    // issue: 2026-10-09-kleros-v2-dev-mapping-endpoint-allowlist
    it.fails("KNOWN BUG: API keys in the context never reach a mapping request", async () => {
      const sent: string[] = [];
      server.use(
        http.post("https://gateway.thegraph.com/*", async ({ request }) => {
          sent.push(request.url, await request.text());
          return HttpResponse.json({ data: {} });
        })
      );

      await executeActions(
        [
          {
            type: "graphql",
            endpoint: "https://gateway.thegraph.com/api/{{graphApiKey}}/subgraphs/id/x",
            query: "{ q }",
            variables: { k: "{{alchemyApiKey}}" },
            seek: [],
            populate: [],
          },
        ],
        { graphApiKey: "graph-secret", alchemyApiKey: "alchemy-secret" }
      ).catch(() => undefined);

      expect(sent.join("\n")).not.toMatch(/graph-secret|alchemy-secret/);
    });
  });
});
