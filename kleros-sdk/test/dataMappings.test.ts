import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { executeActions, populateTemplate, RefuseToArbitrateAnswer } from "../src";
import { server } from "./msw/server";
import { mockChain } from "./helpers/rpc";

const SUBGRAPH = "https://api.studio.thegraph.com/query/1/escrow/v1";
const CORE = "0xA54e7A16d7460e38a8F324eF46782FB520d58CE8";
const TOKEN = "0xa8e4235129258404A2ed3D36DAd20708CcB2d0b7";
const FROM = "0x1234567890123456789012345678901234567890";
const TO = "0x0987654321098765432109876543210987654321";
const CURRENT_RULING =
  "function currentRuling(uint256 _disputeID) view returns (uint256 ruling, bool tied, bool overridden)";
const TRANSFER = "event Transfer(address indexed from, address indexed to, uint256 value)";

describe("full flow", () => {
  it("runs graphql, abi/call, abi/event and json mappings, then populates the template", async () => {
    server.use(
      http.post(SUBGRAPH, () =>
        HttpResponse.json({ data: { escrows: [{ id: "1", amount: "1000", status: "Pending" }] } })
      )
    );
    mockChain({
      reads: [{ address: CORE, abi: CURRENT_RULING, result: () => [1n, false, false] }],
      logs: [{ address: TOKEN, event: TRANSFER, args: { from: FROM, to: TO, value: 100n } }],
    });

    const mappings = [
      {
        type: "graphql",
        endpoint: SUBGRAPH,
        query: "query GetEscrows($buyer: Bytes!) { escrows(where: {buyer: $buyer}) { id amount status } }",
        variables: { buyer: "0x74199ddaC9607A3a694011793f674FA1E0d0Fe2D" },
        seek: ["escrows[0].amount"],
        populate: ["escrowAmount"],
      },
      {
        type: "abi/call",
        abi: CURRENT_RULING,
        address: CORE,
        functionName: "currentRuling",
        args: ["0"],
        seek: ["0", "1", "2"],
        populate: ["ruling", "tied", "overridden"],
      },
      {
        type: "abi/event",
        abi: TRANSFER,
        address: TOKEN,
        eventFilter: { fromBlock: "earliest", toBlock: "latest", args: [] },
        seek: ["from", "to", "value"],
        populate: ["fromAddress", "toAddress", "transferValue"],
      },
      {
        type: "json",
        value: { title: "Dispute: Did the user break the rules?", category: "General" },
        seek: ["title", "category"],
        populate: ["disputeTitle", "disputeCategory"],
      },
    ];
    const template = JSON.stringify({
      title: "{{disputeTitle}}",
      description: "Escrow of {{escrowAmount}}",
      question: "Is the user responsible?",
      category: "{{disputeCategory}}",
      answers: [{ title: "Yes", description: "User is responsible", id: "0x01" }],
      policyURI: "/ipfs/QmUnPyGi31RoF4DRR8vT3u13YsppxtsbBKbdQAbcP8be4M/file.json",
      metadata: {
        ruling: "{{ruling}}",
        tied: "{{tied}}",
        overridden: "{{overridden}}",
        fromAddress: "{{fromAddress}}",
        toAddress: "{{toAddress}}",
        transferValue: "{{transferValue}}",
      },
      arbitratorChainID: "421614",
      arbitratorAddress: TO,
      version: "1.0",
    });

    const data = await executeActions(JSON.parse(JSON.stringify(mappings)), { alchemyApiKey: "unused" });
    const details = populateTemplate(template, data);

    expect(details).toEqual({
      title: "Dispute: Did the user break the rules?",
      description: "Escrow of 1000",
      question: "Is the user responsible?",
      category: "General",
      answers: [RefuseToArbitrateAnswer, { title: "Yes", description: "User is responsible", id: "0x01" }],
      policyURI: "/ipfs/QmUnPyGi31RoF4DRR8vT3u13YsppxtsbBKbdQAbcP8be4M/file.json",
      metadata: {
        ruling: "1",
        tied: "false",
        overridden: "false",
        fromAddress: FROM,
        toAddress: TO,
        transferValue: "100",
      },
      arbitratorChainID: "421614",
      arbitratorAddress: TO,
      version: "1.0",
    });
  });
});
