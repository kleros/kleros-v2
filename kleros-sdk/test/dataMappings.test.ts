import { describe, expect, it } from "vitest";
import { populateTemplate } from "src/dataMappings/utils/populateTemplate";
import { jsonAction } from "src/dataMappings/actions/jsonAction";
import { subgraphAction } from "src/dataMappings/actions/subgraphAction";
import { callAction } from "../src/dataMappings/actions/callAction";
import { eventAction } from "src/dataMappings/actions/eventAction";
import { fetchIpfsJsonAction } from "src/dataMappings/actions/fetchIpfsJsonAction";

const exampleObject = {
  evidence: {
    fileURI: {
      photo: "https://photo.url",
      video: "https://video.url",
    },
  },
};

describe("jsonAction", () => {
  it("should extract and map data correctly", () => {
    const mapping = {
      type: "json",
      value: exampleObject.evidence.fileURI,
      seek: ["photo", "video"],
      populate: ["photoUrl", "videoUrl"],
    };
    const result = jsonAction(mapping);
    expect(result).to.eql({
      photoUrl: "https://photo.url",
      videoUrl: "https://video.url",
    });
  });
});

describe("subgraphAction with variables", () => {
  it("should fetch GraphQL data with variables and return in expected format", async () => {
    const endpoint = "https://api.studio.thegraph.com/query/61738/escrow-v2-devnet/version/latest";
    const query = `
      query GetEscrows($buyer: Bytes!) {
        escrows(where: {buyer: $buyer}) {
          id
          amount
          status
        }
      }
    `;
    const variables = {
      buyer: "0x74199ddaC9607A3a694011793f674FA1E0d0Fe2D",
    };
    const seek = ["escrows"];
    const populate = ["escrowsData"];

    const mapping = {
      type: "graphql",
      endpoint,
      query,
      variables,
      seek,
      populate,
    };

    const result = await subgraphAction(mapping);

    expect(result).to.have.property("escrowsData");
    expect(result.escrowsData).to.be.an("array");
    result.escrowsData.forEach((escrow) => {
      expect(escrow).to.have.property("id");
      expect(escrow).to.have.property("amount");
      expect(escrow).to.have.property("status");
    });
  });
});

describe("callAction", () => {
  it("should call the contract and return token balance", async () => {
    const abi =
      "function currentRuling(uint256 _disputeID) public view returns (uint256 ruling, bool tied, bool overridden)";
    const contractAddress = "0xA54e7A16d7460e38a8F324eF46782FB520d58CE8";
    const disputeId = "0";

    const mapping = {
      type: "abi/call",
      abi,
      address: contractAddress,
      args: [disputeId],
      seek: ["0", "1", "2"],
      populate: ["ruling", "tied", "overriden"],
    };

    const result = await callAction(mapping, "insertAlchemyApiKeyHere");

    expect(result).to.have.property("ruling");
    expect(result.ruling).to.be.a("bigint");
    expect(result).to.have.property("tied");
    expect(result.tied).to.be.a("boolean");
    expect(result).to.have.property("overriden");
    expect(result.overriden).to.be.a("boolean");
  });
});

describe("eventAction", () => {
  it("should fetch event data and return populated data", async () => {
    const eventAbi = "event Transfer(address indexed from, address indexed to, uint256 value)";
    const contractAddress = "0xa8e4235129258404A2ed3D36DAd20708CcB2d0b7";
    const fromBlock = "earliest";
    const toBlock = "latest";

    const mapping = {
      type: "abi/event",
      abi: eventAbi,
      address: contractAddress,
      eventFilter: {
        fromBlock,
        toBlock,
      },
      seek: ["from", "to", "value"],
      populate: ["fromAddress", "toAddress", "transferValue"],
    };

    const result = await eventAction(mapping, "insertAlchemyApiKeyHere");

    expect(result).to.have.property("fromAddress");
    expect(result).to.have.property("toAddress");
    expect(result).to.have.property("transferValue");
    expect(result.transferValue).to.be.a("bigint");
  });
});

describe("fetchIpfsJsonAction", () => {
  it("should fetch JSON data from IPFS and return the expected result", async () => {
    const ipfsUri = "/ipfs/QmQ2XoA25HmnPUEWDduxj6LYwMwp6jtXPFRMHcNF2EvJfU/file.json";
    const seek = ["name", "firstName", "lastName", "anotherFile"];
    const populate = ["name", "firstName", "lastName", "anotherFile"];

    const mapping = {
      type: "fetch/ipfs/json",
      ipfsUri,
      seek,
      populate,
    };

    const result = await fetchIpfsJsonAction(mapping);

    expect(result).to.have.property("name", "Mezozoic");
    expect(result).to.have.property("firstName", "Rafael");
    expect(result).to.have.property("lastName", "Camargo");
    expect(result).to.have.property("anotherFile", "/ipfs/QmUnPyGi31RoF4DRR8vT3u13YsppxtsbBKbdQAbcP8be4M/file.json");
  });
});

describe("populateTemplate", () => {
  it("should correctly populate the template with provided data", () => {
    const template = `{
      "title": "Test Title",
      "description": "Test Description",
      "question": "{{question}}",
      "type": "single-select",
      "answers": [
        {
          "title": "Yes",
          "description": "Affirmative",
          "id": "0x01",
          "reserved": false
        }
      ],
      "policyURI": "https://example.com/policy",
      "frontendUrl": "https://example.com",
      "arbitrableChainID": "100",
      "arbitrableAddress": "0x1234567890123456789012345678901234567890",
      "arbitratorChainID": "421613",
      "arbitratorAddress": "0x0987654321098765432109876543210987654321",
      "category": "General",
      "lang": "en_US",
      "specification": "Spec",
      "version": "1.0"
    }`;
    const data = {
      question: "Did the user break the rules?",
    };

    const result = populateTemplate(template, data);

    expect(result).to.deep.equal({
      title: "Test Title",
      description: "Test Description",
      question: "Did the user break the rules?",
      type: "single-select",
      answers: [
        {
          title: "Yes",
          description: "Affirmative",
          id: "0x01",
          reserved: false,
        },
      ],
      policyURI: "https://example.com/policy",
      frontendUrl: "https://example.com",
      arbitrableChainID: "100",
      arbitrableAddress: "0x1234567890123456789012345678901234567890",
      arbitratorChainID: "421613",
      arbitratorAddress: "0x0987654321098765432109876543210987654321",
      category: "General",
      lang: "en_US",
      specification: "Spec",
      version: "1.0",
    });
  });

  it("should throw an error for invalid JSON", () => {
    const template = `{"title": "{{name}"}`;
    const data = {
      name: "Jane",
    };

    expect(() => populateTemplate(template, data)).to.throw();
  });
});
