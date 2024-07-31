import { describe, expect, it, vi } from "vitest";
import { populateTemplate } from "src/dataMappings/utils/populateTemplate";
import { jsonAction } from "src/dataMappings/actions/jsonAction";
import { subgraphAction } from "src/dataMappings/actions/subgraphAction";
import { callAction } from "src/dataMappings/actions/callAction";
import { eventAction } from "src/dataMappings/actions/eventAction";
import { fetchIpfsJsonAction } from "src/dataMappings/actions/fetchIpfsJsonAction";
import { createResultObject } from "src/dataMappings/utils/createResultObject";
import { executeActions } from "src/dataMappings/executeActions";

global.fetch = vi.fn().mockResolvedValue({
  json: async () => ({
    data: {
      escrows: [
        { id: "1", amount: "1000", status: "Pending" },
        { id: "2", amount: "500", status: "Completed" },
      ],
    },
  }),
});

vi.mock("src/sdk", () => ({
  configureSDK: vi.fn(),
  getPublicClient: vi.fn().mockReturnValue({
    readContract: vi.fn().mockResolvedValue([BigInt(1), false, false]),
    createEventFilter: vi.fn().mockResolvedValue({}),
    getFilterLogs: vi.fn().mockResolvedValue([
      {
        args: {
          from: "0x1234567890123456789012345678901234567890",
          to: "0x0987654321098765432109876543210987654321",
          value: BigInt(100),
        },
      },
    ]),
  }),
}));

interface CallActionResult {
  ruling: bigint;
  tied: boolean;
  overridden: boolean;
}

interface EventActionResult {
  fromAddress: string;
  toAddress: string;
  transferValue: bigint;
}

interface SubgraphActionResult {
  escrowsData: { id: string; amount: string; status: string }[];
}

interface FetchIpfsJsonActionResult {
  name: string;
  firstName: string;
  lastName: string;
  anotherFile: string;
}

const exampleObject = {
  evidence: {
    fileURI: {
      photo: "https://photo.url",
      video: "https://video.url",
    },
  },
};

vi.mock("src/dataMappings/actions/subgraphAction", () => ({
  subgraphAction: vi.fn(async (mapping) => {
    return createResultObject(
      {
        escrows: [
          { id: "1", amount: "1000", status: "Pending" },
          { id: "2", amount: "500", status: "Completed" },
        ],
      },
      mapping.seek,
      mapping.populate
    );
  }),
}));

vi.mock("src/dataMappings/actions/callAction", () => ({
  callAction: vi.fn(async (mapping) => {
    return createResultObject([BigInt(1), false, false], mapping.seek, mapping.populate);
  }),
}));

vi.mock("src/dataMappings/actions/eventAction", () => ({
  eventAction: vi.fn(async (mapping) => {
    const mockEventData = {
      from: "0x1234567890123456789012345678901234567890",
      to: "0x0987654321098765432109876543210987654321",
      value: BigInt(100),
    };
    return createResultObject(mockEventData, mapping.seek, mapping.populate);
  }),
}));

vi.mock("src/dataMappings/actions/fetchIpfsJsonAction", () => ({
  fetchIpfsJsonAction: vi.fn(async (mapping) => {
    return createResultObject(
      {
        name: "Mezozoic",
        firstName: "Rafael",
        lastName: "Camargo",
        anotherFile: "/ipfs/QmUnPyGi31RoF4DRR8vT3u13YsppxtsbBKbdQAbcP8be4M/file.json",
      },
      mapping.seek,
      mapping.populate
    );
  }),
}));

describe("full flow test", () => {
  it("should execute a full flow and return populated dispute details", async () => {
    const dataMappingsInput = JSON.stringify([
      {
        type: "graphql",
        endpoint: "https://mocked_endpoint.com",
        query: `query GetEscrows($buyer: Bytes!) {
          escrows(where: {buyer: $buyer}) {
            id
            amount
            status
          }
        }`,
        variables: { buyer: "0x74199ddaC9607A3a694011793f674FA1E0d0Fe2D" },
        seek: ["escrows"],
        populate: ["escrowsData"],
      },
      {
        type: "abi/call",
        abi: "function currentRuling(uint256 _disputeID) public view returns (uint256 ruling, bool tied, bool overridden)",
        address: "0xA54e7A16d7460e38a8F324eF46782FB520d58CE8",
        args: ["0"],
        seek: ["0", "1", "2"],
        populate: ["ruling", "tied", "overridden"],
      },
      {
        type: "abi/event",
        abi: "event Transfer(address indexed from, address indexed to, uint256 value)",
        address: "0xa8e4235129258404A2ed3D36DAd20708CcB2d0b7",
        eventFilter: {
          fromBlock: "earliest",
          toBlock: "latest",
          args: [],
        },
        seek: ["from", "to", "value"],
        populate: ["fromAddress", "toAddress", "transferValue"],
      },
      {
        type: "json",
        value: {
          title: "Dispute: Did the user break the rules?",
          description: "Detailed description of the dispute",
          category: "General",
        },
        seek: ["title", "description", "category"],
        populate: ["disputeTitle", "disputeDescription", "disputeCategory"],
      },
    ]);

    const disputeTemplateInput = JSON.stringify({
      title: "{{disputeTitle}}",
      description: "{{disputeDescription}}",
      question: "Is the user responsible?",
      category: "{{disputeCategory}}",
      type: "single-select",
      answers: [
        { title: "Yes", description: "User is responsible", id: "0x01" },
        { title: "No", description: "User is not responsible", id: "0x02" },
      ],
      details: {
        ruling: "{{ruling}}",
        tied: "{{tied}}",
        overridden: "{{overridden}}",
        fromAddress: "{{fromAddress}}",
        toAddress: "{{toAddress}}",
        transferValue: "{{transferValue}}",
      },
    });

    const initialContext = { alchemyApiKey: "mocked_api_key" };

    const data = await executeActions(JSON.parse(dataMappingsInput), initialContext);
    const finalDisputeDetails = populateTemplate(disputeTemplateInput, data);

    expect(finalDisputeDetails).to.deep.equal({
      title: "Dispute: Did the user break the rules?",
      description: "Detailed description of the dispute",
      question: "Is the user responsible?",
      category: "General",
      type: "single-select",
      answers: [
        { title: "Yes", description: "User is responsible", id: "0x01" },
        { title: "No", description: "User is not responsible", id: "0x02" },
      ],
      details: {
        ruling: "1",
        tied: "false",
        overridden: "false",
        fromAddress: "0x1234567890123456789012345678901234567890",
        toAddress: "0x0987654321098765432109876543210987654321",
        transferValue: "100",
      },
    });
  });
});

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

  it("should handle empty JSON object gracefully", () => {
    const mapping = {
      type: "json",
      value: {},
      seek: ["nonexistentField"],
      populate: ["resultField"],
    };
    const result = jsonAction(mapping);
    expect(result).to.eql({});
  });
});

describe("subgraphAction with variables", () => {
  it("should fetch GraphQL data with variables and return in expected format", async () => {
    const mapping = {
      type: "graphql",
      endpoint: "mocked_endpoint",
      query: `query GetEscrows($buyer: Bytes!) {
        escrows(where: {buyer: $buyer}) {
          id
          amount
          status
        }
      }`,
      variables: { buyer: "0x74199ddaC9607A3a694011793f674FA1E0d0Fe2D" },
      seek: ["escrows"],
      populate: ["escrowsData"],
    };

    const result = (await subgraphAction(mapping)) as SubgraphActionResult;

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
  it("should call the contract and return in expected format", async () => {
    const mapping = {
      type: "abi/call",
      abi: "function currentRuling(uint256 _disputeID) public view returns (uint256 ruling, bool tied, bool overridden)",
      address: "0xA54e7A16d7460e38a8F324eF46782FB520d58CE8",
      args: ["0"],
      seek: ["0", "1", "2"],
      populate: ["ruling", "tied", "overridden"],
    };

    const result = (await callAction(mapping, "")) as CallActionResult;

    expect(result).to.have.property("ruling");
    expect(result.ruling).to.be.a("bigint");
    expect(result).to.have.property("tied");
    expect(result.tied).to.be.a("boolean");
    expect(result).to.have.property("overridden");
    expect(result.overridden).to.be.a("boolean");
  });
});

describe("eventAction", () => {
  it("should fetch event data and return populated data", async () => {
    const mapping = {
      type: "abi/event",
      abi: "event Transfer(address indexed from, address indexed to, uint256 value)",
      address: "0xa8e4235129258404A2ed3D36DAd20708CcB2d0b7",
      eventFilter: {
        fromBlock: "earliest",
        toBlock: "latest",
        args: [],
      },
      seek: ["from", "to", "value"],
      populate: ["fromAddress", "toAddress", "transferValue"],
    };

    const result = (await eventAction(mapping, "")) as EventActionResult;

    expect(result).to.have.property("fromAddress", "0x1234567890123456789012345678901234567890");
    expect(result).to.have.property("toAddress", "0x0987654321098765432109876543210987654321");
    expect(result).to.have.property("transferValue", BigInt(100));
  });
});

describe("fetchIpfsJsonAction", () => {
  it("should fetch JSON data from IPFS and return the expected result", async () => {
    const mapping = {
      type: "fetch/ipfs/json",
      ipfsUri: "/ipfs/QmQ2XoA25HmnPUEWDduxj6LYwMwp6jtXPFRMHcNF2EvJfU/file.json",
      seek: ["name", "firstName", "lastName", "anotherFile"],
      populate: ["name", "firstName", "lastName", "anotherFile"],
    };

    const result = (await fetchIpfsJsonAction(mapping)) as FetchIpfsJsonActionResult;

    expect(result).to.have.property("name", "Mezozoic");
    expect(result).to.have.property("firstName", "Rafael");
    expect(result).to.have.property("lastName", "Camargo");
    expect(result).to.have.property("anotherFile", "/ipfs/QmUnPyGi31RoF4DRR8vT3u13YsppxtsbBKbdQAbcP8be4M/file.json");
  });
});

describe("populateTemplate", () => {
  it("should correctly populate the template with provided data", () => {
    const template = JSON.stringify({
      title: "Test Title",
      description: "Test Description",
      question: "{{question}}",
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

  it("should handle missing template variables gracefully", () => {
    const template = JSON.stringify({
      title: "Test Title",
      description: "Test Description",
      question: "{{missingQuestion}}",
    });

    const data = {
      question: "Actual question",
    };

    const result = populateTemplate(template, data);

    expect(result).to.deep.equal({
      title: "Test Title",
      description: "Test Description",
      question: "",
    });
  });

  it("should throw an error for invalid JSON", () => {
    const template = '{"title": "{{name}"}';
    const data = { name: "Jane" };

    expect(() => populateTemplate(template, data)).to.throw();
  });
});
