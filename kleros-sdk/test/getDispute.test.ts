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

  const standardRefuseToArbitrateAnswer = {
    id: "0x0",
    title: "Refuse to Arbitrate / Invalid",
    description: "Refuse to Arbitrate / Invalid",
    reserved: true,
  };

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
    expect(result?.answers[0]).toEqual(standardRefuseToArbitrateAnswer);
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
    expect(result?.answers[0]).toEqual(standardRefuseToArbitrateAnswer);
    expect(result?.answers[1].id).toBe("0x1");
    expect(result?.answers[2].id).toBe("0x2");
  });

  it("should only overwrite existing answer with id 0x0 or 0x00's title and not overwrite description", async () => {
    const customRTAAnswer = {
      id: "0x0",
      title: "Custom Refuse Title",
      description: "Custom Refuse Description",
      reserved: true,
    };

    // Test with 0x0
    const mockTemplate0x0 = {
      disputeTemplate: {
        templateData: JSON.stringify({
          title: "Test Dispute",
          description: "Test Description",
          question: "Test Question",
          answers: [
            customRTAAnswer,
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
    vi.mocked(fetchDisputeTemplateFromId).mockResolvedValue(mockTemplate0x0);

    let result = await getDispute({
      disputeId: mockDisputeId,
      coreSubgraph: mockCoreSubgraph,
      dtrSubgraph: mockDtrSubgraph,
    });

    expect(result?.answers).toHaveLength(2);
    expect(result?.answers[0].title).toEqual(standardRefuseToArbitrateAnswer.title);
    expect(result?.answers[0].description).toEqual(customRTAAnswer.description);
    expect(result?.answers[1].id).toBe("0x1");

    // Test with 0x00
    const mockTemplate0x00 = {
      disputeTemplate: {
        templateData: JSON.stringify({
          title: "Test Dispute",
          description: "Test Description",
          question: "Test Question",
          answers: [
            customRTAAnswer,
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

    vi.mocked(fetchDisputeTemplateFromId).mockResolvedValue(mockTemplate0x00);

    result = await getDispute({
      disputeId: mockDisputeId,
      coreSubgraph: mockCoreSubgraph,
      dtrSubgraph: mockDtrSubgraph,
    });

    expect(result?.answers).toHaveLength(2);
    expect(result?.answers[0].title).toEqual(standardRefuseToArbitrateAnswer.title);
    expect(result?.answers[0].description).toEqual(customRTAAnswer.description);
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
