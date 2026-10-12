import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { getDispute } from "../src/utils/getDispute";
import { configureSDK } from "../src/sdk";
import { NotFoundError } from "../src/errors";
import { RefuseToArbitrateAnswer } from "../src";
import { server } from "./msw/server";
import { createMockTransport, mockChain } from "./helpers/rpc";
import { serveSubgraphs, uniqueEndpoints, type DisputeFixture } from "./helpers/subgraphs";
import { aDispute, aTemplate, readTemplateFile } from "./fixtures/disputeDetails";
import { newQuestionLog, newTemplateLog, QUESTION_ID, REALITY, REALITY_PROXY } from "./fixtures/reality";

const ARBITRABLE = "0x1234567890123456789012345678901234567890";
const dispute = (templateId = 1): DisputeFixture => ({
  arbitrated: { id: ARBITRABLE },
  arbitrableChainId: 421614,
  templateId,
});

const run = async ({
  templateData = aTemplate(),
  templateDataMappings = "",
  options,
}: {
  templateData?: string;
  templateDataMappings?: string;
  options?: Parameters<typeof getDispute>[0]["options"];
} = {}) => {
  const endpoints = uniqueEndpoints();
  const variables = serveSubgraphs(endpoints, { dispute: dispute(), template: { templateData, templateDataMappings } });
  const result = await getDispute({ disputeId: 123n, ...endpoints, options });
  return { result, variables };
};

describe("getDispute", () => {
  it("fetches the dispute, then its template, and populates it", async () => {
    const { result, variables } = await run();

    expect(variables).toEqual({ dispute: [{ id: "123" }], template: [{ id: "1" }] });
    expect(result).toEqual({ ...aDispute(), answers: [RefuseToArbitrateAnswer, ...aDispute().answers] });
  });

  it("adds Refuse to Arbitrate when the template has no answers", async () => {
    const { result } = await run({ templateData: aTemplate({ answers: [] }) });

    expect(result?.answers).toEqual([RefuseToArbitrateAnswer]);
  });

  it.each(["0x0", "0x00"])("overrides the title of answer %s and keeps its description", async (id) => {
    const custom = { id, title: "Custom Refuse Title", description: "Custom Refuse Description", reserved: true };
    const yes = { id: "0x1", title: "Yes", description: "Yes Description" };

    const { result } = await run({ templateData: aTemplate({ answers: [custom, yes] }) });

    expect(result?.answers).toEqual([{ ...RefuseToArbitrateAnswer, description: custom.description }, yes]);
  });

  it("exposes arbitrableAddress and arbitrableChainID to the mappings", async () => {
    const mappings = JSON.stringify([
      {
        type: "json",
        value: { a: "{{arbitrableAddress}}", c: "{{arbitrableChainID}}" },
        seek: ["a", "c"],
        populate: ["a", "c"],
      },
    ]);

    const { result } = await run({
      templateData: aTemplate({ metadata: { a: "{{a}}", c: "{{c}}" } }),
      templateDataMappings: mappings,
    });

    expect(result?.metadata).toEqual({ a: ARBITRABLE, c: "421614" });
  });

  it("lets additionalContext override the subgraph-derived context", async () => {
    const { result } = await run({
      templateData: aTemplate({ metadata: { a: "{{arbitrableAddress}}", extra: "{{extra}}" } }),
      templateDataMappings: "[]",
      options: { additionalContext: { arbitrableAddress: "0xoverride", extra: "x" } },
    });

    expect(result?.metadata).toEqual({ a: "0xoverride", extra: "x" });
  });

  it("does not pass the subgraph-derived context to the template when there are no mappings", async () => {
    const { result } = await run({ templateData: aTemplate({ metadata: { a: "{{arbitrableAddress}}" } }) });

    expect(result?.metadata).toEqual({ a: "" });
  });

  it("rejects when templateDataMappings is not JSON", async () => {
    await expect(run({ templateDataMappings: "[not json" })).rejects.toThrow(SyntaxError);
  });

  it("applies options.sdkConfig before running abi mappings", async () => {
    configureSDK(createMockTransport().sdkConfig);
    const abi = "function name() view returns (string)";
    const { sdkConfig } = createMockTransport({ reads: [{ address: ARBITRABLE, abi, result: () => "Escrow" }] });
    const mappings = JSON.stringify([
      {
        type: "abi/call",
        abi,
        address: "{{arbitrableAddress}}",
        functionName: "name",
        args: [],
        seek: ["value"],
        populate: ["name"],
      },
    ]);

    const { result } = await run({
      templateData: aTemplate({ title: "{{name}}" }),
      templateDataMappings: mappings,
      options: { sdkConfig },
    });

    expect(result?.title).toBe("Escrow");
  });

  it("throws NotFoundError when the dispute does not exist", async () => {
    const endpoints = uniqueEndpoints();
    serveSubgraphs(endpoints, { dispute: null });

    await expect(getDispute({ disputeId: 123n, ...endpoints })).rejects.toThrow(
      new NotFoundError("Dispute Details", "Dispute details not found for disputeId: 123")
    );
  });

  // issue: unfiled (getDispute checks the query result, not result.disputeTemplate)
  it.fails("KNOWN BUG: throws NotFoundError when the template does not exist", async () => {
    const endpoints = uniqueEndpoints();
    serveSubgraphs(endpoints, { dispute: dispute(), template: null });

    await expect(getDispute({ disputeId: 123n, ...endpoints })).rejects.toThrow(NotFoundError);
  });
});

describe("getDispute with config/v2-disputetemplate fixtures", () => {
  it("renders reality/example3 (json mapping + sectioned answers template)", async () => {
    const { result } = await run({
      templateData: readTemplateFile("reality/example3/DisputeTemplate.json.mustache"),
      templateDataMappings: readTemplateFile("reality/example3/DisputeMappings.json"),
    });

    expect(result).toMatchObject({
      title: "A reality.eth question",
      type: "single-select",
      frontendUrl:
        "https://reality.eth.limo/app/#!/question/0x14a6748192aBC6E10CA694Ae07bDd4327D6c7A51-" +
        "0xe2a3bd38e3ad4e22336ac35b221bbbdd808d716209f84014c7bc3bf62f8e3b39",
      answers: [
        { ...RefuseToArbitrateAnswer, description: "" },
        { id: "0x01", title: "Yes", description: "The user broke the rules.", reserved: false },
        { id: "0x02", title: "No", description: "The user didnt break the rules.", reserved: false },
        {
          id: "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          title: "Answered Too Soon",
          description: "",
          reserved: true,
        },
      ],
    });
  });

  it("renders the reality/example3 template from a live reality mapping", async () => {
    mockChain({ logs: [newQuestionLog(), newTemplateLog(0)] });
    const mappings = JSON.stringify([
      { type: "reality", realityQuestionID: "{{externalDisputeID}}", seek: [], populate: [] },
    ]);

    const { result } = await run({
      templateData: readTemplateFile("reality/example3/DisputeTemplate.json.mustache"),
      templateDataMappings: mappings,
      options: { additionalContext: { externalDisputeID: QUESTION_ID, arbitrableAddress: REALITY_PROXY } },
    });

    expect(result?.question).toBe("Did the user break the rules?␟content moderation␟en_US");
    expect(result?.frontendUrl).toBe(`https://reality.eth.limo/app/#!/question/${REALITY}-${QUESTION_ID}`);
    expect(result?.answers.map((a) => [a.id, a.title])).toEqual([
      ["0x0", RefuseToArbitrateAnswer.title],
      ["0x01", "Yes"],
      ["0x02", "No"],
      ["0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", "Answered Too Soon"],
    ]);
  });

  const escrowTemplate = aTemplate({
    title: "{{escrowTitle}}",
    description: "{{deliverableText}}",
    attachment: { label: "Transaction Terms", uri: "{{extraDescriptionUri}}" },
    aliases: { Buyer: "{{address}}", Seller: "{{sendingRecipientAddress}}" },
  });

  const runEscrow = (transactionUri: string, servedUrl: string) => {
    server.use(
      http.post("https://api.thegraph.com/subgraphs/name/kemuru/escrow-v2-devnet", () =>
        HttpResponse.json({
          data: {
            escrow: {
              transactionUri,
              buyer: "0x1111111111111111111111111111111111111111",
              seller: "0x2222222222222222222222222222222222222222",
              amount: "1000",
              asset: "native",
              deadline: "1700000000",
            },
          },
        })
      ),
      http.get("https://ipfs.io/*", ({ request }) =>
        request.url === servedUrl
          ? HttpResponse.json({ title: "Logo design", description: "Deliver a logo", extraDescriptionUri: "QmExtra" })
          : HttpResponse.json({ error: "not found" }, { status: 404 })
      )
    );
    return run({
      templateData: escrowTemplate,
      templateDataMappings: readTemplateFile("escrow/example2/DisputeMappings.json.mustache"),
      options: { additionalContext: { externalDisputeID: "7" } },
    });
  };

  const escrowDetails = {
    title: "Logo design",
    description: "Deliver a logo",
    attachment: { label: "Transaction Terms", uri: "QmExtra" },
    aliases: {
      Buyer: "0x1111111111111111111111111111111111111111",
      Seller: "0x2222222222222222222222222222222222222222",
    },
  };

  it("runs escrow/example2 mappings (graphql + fetch/ipfs/json) end to end", async () => {
    const { result } = await runEscrow("QmTx", "https://ipfs.io/ipfs/QmTx");

    expect(result).toMatchObject(escrowDetails);
  });

  // issue: unfiled (mustache HTML-escapes values rendered into mapping endpoints, queries and args)
  it.fails("KNOWN BUG: runs escrow/example2 mappings when transactionUri is an /ipfs/ path", async () => {
    const { result } = await runEscrow("/ipfs/QmTx/transaction.json", "https://ipfs.io/ipfs/QmTx/transaction.json");

    expect(result).toMatchObject(escrowDetails);
  });

  it("rejects the escrow/example2 template, whose answers have no ids", async () => {
    await expect(
      run({
        templateData: readTemplateFile("escrow/example2/DisputeTemplate.json.mustache"),
        templateDataMappings: "[]",
      })
    ).rejects.toThrow(/answers/);
  });
});
