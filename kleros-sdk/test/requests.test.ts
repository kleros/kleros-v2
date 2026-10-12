import { describe, expect, it } from "vitest";
import { graphql, HttpResponse } from "msw";
import { CombinedError } from "@urql/core";
import fetchDisputeDetails from "../src/requests/fetchDisputeDetails";
import fetchDisputeTemplateFromId from "../src/requests/fetchDisputeTemplateFromId";
import getClient from "../src/requests/gqlClient";
import { server } from "./msw/server";
import { serveSubgraphs, uniqueEndpoints } from "./helpers/subgraphs";

const dispute = { arbitrated: { id: "0x1234" }, arbitrableChainId: 421614, templateId: 3 };
const template = { templateData: "{}", templateDataMappings: "[]" };

describe("getClient", () => {
  it("reuses one client per endpoint", () => {
    const { coreSubgraph, dtrSubgraph } = uniqueEndpoints();

    expect(getClient(coreSubgraph)).toBe(getClient(coreSubgraph));
    expect(getClient(coreSubgraph)).not.toBe(getClient(dtrSubgraph));
  });
});

describe("fetchDisputeDetails", () => {
  it("queries the dispute by its decimal id", async () => {
    const endpoints = uniqueEndpoints();
    const variables = serveSubgraphs(endpoints, { dispute });

    const result = await fetchDisputeDetails(endpoints.coreSubgraph, 123n);

    expect(variables.dispute).toEqual([{ id: "123" }]);
    expect(result).toEqual({ dispute });
  });

  it("rejects with a CombinedError carrying GraphQL errors", async () => {
    const { coreSubgraph } = uniqueEndpoints();
    server.use(
      graphql
        .link(coreSubgraph)
        .query("DisputeDetails", () => HttpResponse.json({ errors: [{ message: "indexer down" }] }))
    );

    const error = await fetchDisputeDetails(coreSubgraph, 1n).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CombinedError);
    expect((error as CombinedError).graphQLErrors[0].message).toBe("indexer down");
  });

  it("rejects with a CombinedError carrying the network error", async () => {
    const { coreSubgraph } = uniqueEndpoints();
    server.use(graphql.link(coreSubgraph).query("DisputeDetails", () => HttpResponse.error()));

    const error = await fetchDisputeDetails(coreSubgraph, 1n).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CombinedError);
    expect((error as CombinedError).networkError).toBeDefined();
  });
});

describe("fetchDisputeTemplateFromId", () => {
  it("queries the template by its id", async () => {
    const endpoints = uniqueEndpoints();
    const variables = serveSubgraphs(endpoints, { dispute, template });

    const result = await fetchDisputeTemplateFromId(endpoints.dtrSubgraph, 3);

    expect(variables.template).toEqual([{ id: "3" }]);
    expect(result).toEqual({ disputeTemplate: template });
  });

  it("rejects with a CombinedError carrying GraphQL errors", async () => {
    const { dtrSubgraph } = uniqueEndpoints();
    server.use(
      graphql.link(dtrSubgraph).query("DisputeTemplate", () => HttpResponse.json({ errors: [{ message: "bad id" }] }))
    );

    await expect(fetchDisputeTemplateFromId(dtrSubgraph, 3)).rejects.toThrow(CombinedError);
  });
});
