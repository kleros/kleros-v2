import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, it, expect, vi } from "vitest";

import { TEST_URLS } from "src/test/env";
import { server } from "src/test/msw/server";
import { renderHookWithProviders } from "src/test/renderWithProviders";

import { useSpamEvidence } from "./useSpamEvidence";

interface SpamRequest {
  variables: { deployment: string; evidenceGroupId: string };
}

/** Atlas answers with the evidence ids flagged as spam for the requested group. */
const atlasSpam = (spamByGroup: Record<string, string[]>) => {
  const requests: SpamRequest["variables"][] = [];
  server.use(
    http.post(`${TEST_URLS.atlas}/graphql`, async ({ request }) => {
      const { variables } = (await request.json()) as SpamRequest;
      requests.push(variables);
      return HttpResponse.json({
        data: { courtv2EvidenceSpamsByGroupId: { evidenceIds: spamByGroup[variables.evidenceGroupId] ?? [] } },
      });
    })
  );
  return requests;
};

describe("useSpamEvidence", () => {
  it("fetches the spam evidence ids of a group from Atlas", async () => {
    const requests = atlasSpam({ "12": ["3", "7"] });

    const { result } = renderHookWithProviders(() => useSpamEvidence("12"));

    await waitFor(() => expect(result.current.data?.courtv2EvidenceSpamsByGroupId.evidenceIds).toEqual(["3", "7"]));
    expect(requests).toEqual([{ deployment: "devnet", evidenceGroupId: "12" }]);
  });

  it.each([
    ["testnet", "testnet"],
    ["mainnet", "beta"],
  ])("asks Atlas for the %s deployment as %j", async (deployment, atlasDeployment) => {
    vi.stubEnv("REACT_APP_DEPLOYMENT", deployment);
    const requests = atlasSpam({});

    const { result } = renderHookWithProviders(() => useSpamEvidence("1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requests[0].deployment).toBe(atlasDeployment);
  });

  it.fails("KNOWN BUG: the query key omits evidenceGroupId, so two disputes share one spam list", async () => {
    atlasSpam({ "1": ["9"], "2": [] });

    const { result } = renderHookWithProviders(() => [useSpamEvidence("1"), useSpamEvidence("2")]);

    await waitFor(() => expect(result.current[1].isSuccess).toBe(true));
    expect(result.current[1].data?.courtv2EvidenceSpamsByGroupId.evidenceIds).toEqual([]);
  });
});
