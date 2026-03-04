import { DisputeKits } from "src/consts";

interface BaseFundAppealParams {
  disputeId: bigint;
  choice: bigint;
  fundAmount: bigint;
  type: DisputeKits;
}

export interface ClassicFundAppealParams extends BaseFundAppealParams {
  type: DisputeKits.Classic;
}

export interface ShutterFundAppealParams extends BaseFundAppealParams {
  type: DisputeKits.Shutter;
}

export interface GatedFundAppealParams extends BaseFundAppealParams {
  type: DisputeKits.Gated;
}

export interface GatedShutterFundAppealParams extends BaseFundAppealParams {
  type: DisputeKits.GatedShutter;
}

export interface ArgentinaConsumerProtectionFundAppealParams extends BaseFundAppealParams {
  type: DisputeKits.ArgentinaConsumerProtection;
}

export type FundAppealParams =
  | ClassicFundAppealParams
  | ShutterFundAppealParams
  | GatedFundAppealParams
  | GatedShutterFundAppealParams
  | ArgentinaConsumerProtectionFundAppealParams;
