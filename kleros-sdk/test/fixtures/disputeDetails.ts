import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const ARBITRATOR = "0xD08Ab99480d02bf9C092828043f611BcDFEA917b";

/** Minimal object that satisfies DisputeDetailsSchema. */
export const aDispute = (overrides: Record<string, unknown> = {}) => ({
  title: "Test Dispute",
  description: "Test Description",
  question: "Does it comply?",
  answers: [
    { id: "0x1", title: "Yes", description: "It complies" },
    { id: "0x2", title: "No", description: "It does not comply" },
  ],
  policyURI: "/ipfs/QmUnPyGi31RoF4DRR8vT3u13YsppxtsbBKbdQAbcP8be4M/policy.pdf",
  arbitratorChainID: "421614",
  arbitratorAddress: ARBITRATOR,
  version: "1.0",
  ...overrides,
});

export const aTemplate = (overrides: Record<string, unknown> = {}) => JSON.stringify(aDispute(overrides));

/** Reads a file from kleros-sdk/config/v2-disputetemplate. */
export const readTemplateFile = (relativePath: string) =>
  readFileSync(resolve(__dirname, "../../config/v2-disputetemplate", relativePath), "utf8");
