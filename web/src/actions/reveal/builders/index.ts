import { DisputeKits } from "src/dispute-kits";

import { RevealContext } from "../context";
import { RevealParams } from "../params";

import { argentinaConsumerProtectionRevealBuilder } from "./argentinaConsumerProtection.builder";
import { RevealBuilder } from "./baseBuilder";
import { classicRevealBuilder } from "./classic.builder";
import { classicUniversityRevealBuilder } from "./classicUniversity.builder";
import { gatedRevealBuilder } from "./gated.builder";
import { gatedShutterRevealBuilder } from "./gatedShutter.builder";
import { shutterRevealBuilder } from "./shutter.builder";

/**
 * Mapping of dispute kit types to their respective reveal builders.
 *
 * Each builder handles the construction of a transaction for the
 * specific dispute kit, including preparing ABI, functionName,
 * args.
 */
const builders: Record<DisputeKits, RevealBuilder> = {
  [DisputeKits.Classic]: classicRevealBuilder,
  [DisputeKits.Shutter]: shutterRevealBuilder,
  [DisputeKits.Gated]: gatedRevealBuilder,
  [DisputeKits.GatedShutter]: gatedShutterRevealBuilder,
  [DisputeKits.ArgentinaConsumerProtection]: argentinaConsumerProtectionRevealBuilder,
  [DisputeKits.ClassicUniversity]: classicUniversityRevealBuilder,
};

/**
 * Builds a reveal transaction for a given dispute kit type.
 *
 * This function selects the correct reveal builder based on
 * `params.disputeKitId` and calls its `build` method, passing the
 * caller-provided `params` and `context`. Dependencies are
 * automatically resolved via each builder's defaults.
 *
 * @param params  Parameters for the reveal transaction. Must include
 *                a `disputeKitId` field corresponding to a `DisputeKits` value.
 * @param context Execution context, usually including chain info and
 *                account data required by the builder.
 *
 * @returns Returns transaction parameters (ABI, functionName, args, etc.) for call to the relevant DisputeKit
 */
export const buildRevealTxn = (params: RevealParams, context: RevealContext) => {
  return builders[params.disputeKitId].build(params, context);
};
