import { isHex, numberToHex } from "viem";

import type { Answer } from "@kleros/kleros-sdk";

import { disputeResolverContractConfig, klerosCoreContractConfig } from "../contracts";
import { DEFAULT_CHAIN, GENERAL_COURT_ID } from "../index";

export const MOCK_IPFS_HASH = "QmVDEj29zAvoBzSPkJMDx7B1Rb5CR8sGNrwei8DDULvDWp";
export const CLASSIC_DISPUTE_KIT_ID = 1;

export interface DisputeData {
  courtId: string;
  numberOfJurors: number;
  disputeKitId: number;
  title: string;
  description: string;
  question: string;
  answers: Answer[];
  policyURI: string;
}

/**
 * Default answers for disputes
 * @note RTA will be added by sdk
 */
export const DEFAULT_ANSWERS: Answer[] = [
  { id: "0x1", title: "Option 1", description: "First option" },
  { id: "0x2", title: "Option 2", description: "Second option" },
];

/**
 * Default dispute data for e2e tests
 */
export const DEFAULT_DISPUTE_DATA: DisputeData = {
  courtId: GENERAL_COURT_ID.toString(),
  numberOfJurors: 3,
  disputeKitId: CLASSIC_DISPUTE_KIT_ID,
  title: "E2E Test Case",
  description: "Test case created for e2e testing",
  question: "Which option should win?",
  answers: DEFAULT_ANSWERS,
  policyURI: MOCK_IPFS_HASH,
};

/**
 * Creates dispute data by merging defaults with custom options
 */
export function createDisputeData(options: Partial<DisputeData> = {}): DisputeData {
  return {
    ...DEFAULT_DISPUTE_DATA,
    ...options,
    answers: options.answers ?? DEFAULT_DISPUTE_DATA.answers,
  };
}

/**
 * Formats answers with proper hex IDs for the dispute template
 * @todo Extract to a util and write unit tests, should be used by code under test too
 */
export function formatAnswersForTemplate(answers: Answer[]): Answer[] {
  return answers.map((a) => ({
    id: isHex(a.id) ? a.id : numberToHex(BigInt(a.id)),
    title: a.title,
    description: a.description,
  }));
}

/**
 * Creates a dispute template JSON string from dispute data
 */
export function createDisputeTemplate(data: DisputeData): string {
  return JSON.stringify({
    title: data.title,
    description: data.description,
    question: data.question,
    answers: formatAnswersForTemplate(data.answers),
    policyURI: `/ipfs/${data.policyURI}`,
    arbitratorAddress: klerosCoreContractConfig.address,
    arbitratorChainID: DEFAULT_CHAIN.id.toString(),
    arbitrableAddress: disputeResolverContractConfig.address,
    arbitrableChainID: DEFAULT_CHAIN.id.toString(),
    version: "1.0",
  });
}

/**
 * Pre built dispute data for common test scenarios
 * @todo add scenarios for dispute kits
 */
export const DISPUTE_SCENARIOS = {
  simple: DEFAULT_DISPUTE_DATA,

  multipleOptions: createDisputeData({
    title: "Multi-Option Dispute",
    question: "Select the best option",
    answers: [
      { id: "0x1", title: "Option A", description: "First choice" },
      { id: "0x2", title: "Option B", description: "Second choice" },
      { id: "0x3", title: "Option C", description: "Third choice" },
      { id: "0x4", title: "Option D", description: "Fourth choice" },
    ],
  }),

  singleJuror: createDisputeData({
    numberOfJurors: 1,
    title: "Single Juror Test",
  }),

  manyJurors: createDisputeData({
    numberOfJurors: 5,
    title: "Many Jurors Test",
  }),

  classicKit: createDisputeData({
    disputeKitId: CLASSIC_DISPUTE_KIT_ID,
    title: "Classic Kit Dispute",
  }),
} as const;

export { getDisputeInfo } from "./getDisputeInfo";
export { executeRulingForDispute } from "./executeRulingForDispute";
export { drawJurors } from "./drawJurors";
export { passPeriod } from "./passPeriod";
