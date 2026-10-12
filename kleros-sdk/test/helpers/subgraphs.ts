import { graphql, HttpResponse } from "msw";
import { server } from "../msw/server";

let counter = 0;

/**
 * Unique subgraph URLs per call: `gqlClient` keeps one urql Client with a cache per endpoint for the process lifetime.
 */
export const uniqueEndpoints = () => {
  counter += 1;
  return {
    coreSubgraph: `https://core.subgraph.test/${counter}`,
    dtrSubgraph: `https://dtr.subgraph.test/${counter}`,
  };
};

export type DisputeFixture = { arbitrated: { id: string }; arbitrableChainId: number; templateId: number } | null;
export type TemplateFixture = { templateData: string; templateDataMappings: string } | null;

/** Serves the DisputeDetails and DisputeTemplate queries and records their variables. */
export const serveSubgraphs = (
  endpoints: { coreSubgraph: string; dtrSubgraph: string },
  { dispute, template }: { dispute: DisputeFixture; template?: TemplateFixture }
) => {
  const variables: { dispute: unknown[]; template: unknown[] } = { dispute: [], template: [] };
  server.use(
    graphql.link(endpoints.coreSubgraph).query("DisputeDetails", ({ variables: v }) => {
      variables.dispute.push(v);
      return HttpResponse.json({ data: { dispute } });
    }),
    graphql.link(endpoints.dtrSubgraph).query("DisputeTemplate", ({ variables: v }) => {
      variables.template.push(v);
      return HttpResponse.json({ data: { disputeTemplate: template ?? null } });
    })
  );
  return variables;
};
