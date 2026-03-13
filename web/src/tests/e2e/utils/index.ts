import { hardhat } from "viem/chains";

export { ACCOUNT_PKEYS, type AccountKey } from "./accounts";

export const ONE_THOUSAND_PNK = 1000n;
export const PNK_DECIMALS = 18;
export const GENERAL_COURT_ID = 1n;

export const ONE_MINUTE = 60;
// We might want to configure this through the cmd arguments/ config ltr when we support tenderly or other chain testing
export const DEFAULT_CHAIN = hardhat;

export {
  DEFAULT_ANSWERS,
  DEFAULT_DISPUTE_DATA,
  DISPUTE_SCENARIOS,
  createDisputeData,
  createDisputeTemplate,
  formatAnswersForTemplate,
} from "./dispute";

export { setupCase, type SetupCaseOptions, type SetupCaseResult } from "./setupCase";
export { passToPhase, SortitionPhase } from "./passToPhase";
export { setupStake, type SetupStakeOptions } from "./setupStake";
