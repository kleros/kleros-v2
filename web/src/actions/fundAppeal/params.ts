import { DisputeKits } from "src/dispute-kits/disputeKits";

interface BaseFundAppealParams {
  disputeId: bigint;
  choice: bigint;
  fundAmount: bigint;
  disputeKitId: DisputeKits;
}

export interface ClassicFundAppealParams extends BaseFundAppealParams {
  disputeKitId: DisputeKits.Classic;
}

export interface ShutterFundAppealParams extends BaseFundAppealParams {
  disputeKitId: DisputeKits.Shutter;
}

export interface GatedFundAppealParams extends BaseFundAppealParams {
  disputeKitId: DisputeKits.Gated;
}

export interface GatedShutterFundAppealParams extends BaseFundAppealParams {
  disputeKitId: DisputeKits.GatedShutter;
}

export interface ArgentinaConsumerProtectionFundAppealParams extends BaseFundAppealParams {
  disputeKitId: DisputeKits.ArgentinaConsumerProtection;
}

export interface ClassicUniversityFundAppealParams extends BaseFundAppealParams {
  disputeKitId: DisputeKits.ClassicUniversity;
}

export type FundAppealParams =
  | ClassicFundAppealParams
  | ShutterFundAppealParams
  | GatedFundAppealParams
  | GatedShutterFundAppealParams
  | ArgentinaConsumerProtectionFundAppealParams
  | ClassicUniversityFundAppealParams;
