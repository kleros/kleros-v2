import { DisputeKits } from "src/consts";

import { FundAppealContext } from "../context";
import { FundAppealParams } from "../params";

import { argentinaConsumerProtectionFundAppealBuilder } from "./argentinaConsumerProtection.builder";
import { FundAppealBuilder } from "./baseBuilder";
import { classicFundAppealBuilder } from "./classic.builder";
import { classicUniversityFundAppealBuilder } from "./classicUniversity.builder";
import { gatedFundAppealBuilder } from "./gated.builder";
import { gatedShutterFundAppealBuilder } from "./gatedShutter.builder";
import { shutterFundAppealBuilder } from "./shutter.builder";

/**
 * Mapping of dispute kit types to their respective fund appeal builders.
 *
 * Each builder handles the construction of a transaction for the
 * specific dispute kit, including preparing ABI, functionName,
 * args.
 */
const builders: Record<DisputeKits, FundAppealBuilder> = {
  [DisputeKits.Classic]: classicFundAppealBuilder,
  [DisputeKits.Shutter]: shutterFundAppealBuilder,
  [DisputeKits.Gated]: gatedFundAppealBuilder,
  [DisputeKits.GatedShutter]: gatedShutterFundAppealBuilder,
  [DisputeKits.ArgentinaConsumerProtection]: argentinaConsumerProtectionFundAppealBuilder,
  [DisputeKits.ClassicUniversity]: classicUniversityFundAppealBuilder,
};

/**
 * Builds a fund appeal transaction for a given dispute kit type.
 *
 * This function selects the correct fund appeal builder based on
 * `params.type` and calls its `build` method, passing the
 * caller-provided `params` and `context`. Dependencies are
 * automatically resolved via each builder's defaults.
 *
 * @param params  Parameters for the fund transaction. Must include
 *                a `type` field corresponding to a `DisputeKits` value.
 * @param context Execution context, usually including chain info and
 *                account data required by the builder.
 *
 * @returns Returns transaction parameters (ABI, functionName, args, etc.) for call to the relevant DisputeKit
 */
export const buildFundAppealTxn = (params: FundAppealParams, context: FundAppealContext) => {
  return builders[params.type].build(params, context);
};
