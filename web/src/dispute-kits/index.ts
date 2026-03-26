/** Tests that mock `hooks/contracts/generated`
 *  should import `DisputeKits` from `./disputeKits` so the registry is not loaded before mocks */
export { DisputeKits } from "./disputeKits";
export { getDisputeKitConfig, getDisputeKitConfigByAddress, getDisputeKitConfigByKitId } from "./registry";
export type { DisputeKitVotingProps, DisputeKitConfig, OverviewExtraInfoProps, DisputeKitAppealProps } from "./types";
