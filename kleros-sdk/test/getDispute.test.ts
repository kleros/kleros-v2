import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDispute } from "../src/utils/getDispute";
import fetchDisputeDetails from "../src/requests/fetchDisputeDetails";
import fetchDisputeTemplateFromId from "../src/requests/fetchDisputeTemplateFromId";

// Mock the dependencies
vi.mock("../src/requests/fetchDisputeDetails");
vi.mock("../src/requests/fetchDisputeTemplateFromId");

describe("getDispute", () => {
  const mockDisputeId = 123n;
  const mockCoreSubgraph = "https://api.thegraph.com/subgraphs/name/kleros/core";
  const mockDtrSubgraph = "https://api.thegraph.com/subgraphs/name/kleros/dtr";

  const mockDisputeDetails = {
    dispute: {
      templateId: 1,
      arbitrated: { id: "0x1234" },
      arbitrableChainId: 1,
      externalDisputeId: 123,
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should add Refuse to Arbitrate option when answers array is empty", async () => {
    const mockTemplate = {
      disputeTemplate: {
        templateData: JSON.stringify({
          title: "Test Dispute",
          description: "Test Description",
          question: "Test Question",
          answers: [],
          policyURI: "/ipfs/test",
          arbitratorChainID: "1",
          arbitratorAddress: "0x1234567890123456789012345678901234567890",
          version: "1.0.0",
        }),
        templateDataMappings: "",
      },
    };

    vi.mocked(fetchDisputeDetails).mockResolvedValue(mockDisputeDetails);
    vi.mocked(fetchDisputeTemplateFromId).mockResolvedValue(mockTemplate);

    const result = await getDispute({
      disputeId: mockDisputeId,
      coreSubgraph: mockCoreSubgraph,
      dtrSubgraph: mockDtrSubgraph,
    });

    expect(result?.answers).toHaveLength(1);
    expect(result?.answers[0]).toEqual({
      id: "0x0",
      title: "Refuse to Arbitrate / Invalid",
      description: "Refuse to Arbitrate / Invalid",
      reserved: true,
    });
  });

  it("should add Refuse to Arbitrate option when it doesn't exist in answers", async () => {
    const mockTemplate = {
      disputeTemplate: {
        templateData: JSON.stringify({
          title: "Test Dispute",
          description: "Test Description",
          question: "Test Question",
          answers: [
            {
              id: "0x1",
              title: "Yes",
              description: "Yes Description",
            },
            {
              id: "0x2",
              title: "No",
              description: "No Description",
            },
          ],
          policyURI: "/ipfs/test",
          arbitratorChainID: "1",
          arbitratorAddress: "0x1234567890123456789012345678901234567890",
          version: "1.0.0",
        }),
        templateDataMappings: "",
      },
    };

    vi.mocked(fetchDisputeDetails).mockResolvedValue(mockDisputeDetails);
    vi.mocked(fetchDisputeTemplateFromId).mockResolvedValue(mockTemplate);

    const result = await getDispute({
      disputeId: mockDisputeId,
      coreSubgraph: mockCoreSubgraph,
      dtrSubgraph: mockDtrSubgraph,
    });

    expect(result?.answers).toHaveLength(3);
    expect(result?.answers[0]).toEqual({
      id: "0x0",
      title: "Refuse to Arbitrate / Invalid",
      description: "Refuse to Arbitrate / Invalid",
      reserved: true,
    });
    expect(result?.answers[1].id).toBe("0x1");
    expect(result?.answers[2].id).toBe("0x2");
  });

  it("should not add Refuse to Arbitrate option when it already exists with id 0x0", async () => {
    const mockTemplate = {
      disputeTemplate: {
        templateData: JSON.stringify({
          title: "Test Dispute",
          description: "Test Description",
          question: "Test Question",
          answers: [
            {
              id: "0x0",
              title: "Refuse to Arbitrate / Invalid",
              description: "Refuse to Arbitrate / Invalid",
              reserved: true,
            },
            {
              id: "0x1",
              title: "Yes",
              description: "Yes Description",
            },
          ],
          policyURI: "/ipfs/test",
          arbitratorChainID: "1",
          arbitratorAddress: "0x1234567890123456789012345678901234567890",
          version: "1.0.0",
        }),
        templateDataMappings: "",
      },
    };

    vi.mocked(fetchDisputeDetails).mockResolvedValue(mockDisputeDetails);
    vi.mocked(fetchDisputeTemplateFromId).mockResolvedValue(mockTemplate);

    const result = await getDispute({
      disputeId: mockDisputeId,
      coreSubgraph: mockCoreSubgraph,
      dtrSubgraph: mockDtrSubgraph,
    });

    expect(result?.answers).toHaveLength(2);
    expect(result?.answers[0].id).toBe("0x0");
    expect(result?.answers[1].id).toBe("0x1");
  });

  it("should not add Refuse to Arbitrate option when it already exists with id 0x00", async () => {
    const mockTemplate = {
      disputeTemplate: {
        templateData: JSON.stringify({
          title: "Test Dispute",
          description: "Test Description",
          question: "Test Question",
          answers: [
            {
              id: "0x00",
              title: "Custom Refuse Title",
              description: "Custom Refuse Description",
              reserved: true,
            },
            {
              id: "0x1",
              title: "Yes",
              description: "Yes Description",
            },
          ],
          policyURI: "/ipfs/test",
          arbitratorChainID: "1",
          arbitratorAddress: "0x1234567890123456789012345678901234567890",
          version: "1.0.0",
        }),
        templateDataMappings: "",
      },
    };

    vi.mocked(fetchDisputeDetails).mockResolvedValue(mockDisputeDetails);
    vi.mocked(fetchDisputeTemplateFromId).mockResolvedValue(mockTemplate);

    const result = await getDispute({
      disputeId: mockDisputeId,
      coreSubgraph: mockCoreSubgraph,
      dtrSubgraph: mockDtrSubgraph,
    });

    expect(result?.answers).toHaveLength(2);
    expect(result?.answers[0].id).toBe("0x00");
    expect(result?.answers[0].title).toBe("Custom Refuse Title");
    expect(result?.answers[1].id).toBe("0x1");
  });

  it("should throw NotFoundError when dispute details are not found", async () => {
    vi.mocked(fetchDisputeDetails).mockResolvedValue({ dispute: null } as any);

    await expect(
      getDispute({
        disputeId: mockDisputeId,
        coreSubgraph: mockCoreSubgraph,
        dtrSubgraph: mockDtrSubgraph,
      })
    ).rejects.toThrow("Dispute details not found");
  });

  it("should throw NotFoundError when template is not found", async () => {
    vi.mocked(fetchDisputeDetails).mockResolvedValue(mockDisputeDetails);
    vi.mocked(fetchDisputeTemplateFromId).mockResolvedValue(undefined);

    await expect(
      getDispute({
        disputeId: mockDisputeId,
        coreSubgraph: mockCoreSubgraph,
        dtrSubgraph: mockDtrSubgraph,
      })
    ).rejects.toThrow("Template not found");
  });
});
