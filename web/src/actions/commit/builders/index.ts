import { DisputeKits } from "src/dispute-kits";

import { CommitContext } from "../context";
import { CommitParams } from "../params";

import { argentinaConsumerProtectionCommitBuilder } from "./argentinaConsumerProtection.builder";
import { CommitBuilder } from "./baseBuilder";
import { classicCommitBuilder } from "./classic.builder";
import { classicUniversityCommitBuilder } from "./classicUniversity.builder";
import { gatedCommitBuilder } from "./gated.builder";
import { gatedShutterCommitBuilder } from "./gatedShutter.builder";
import { shutterCommitBuilder } from "./shutter.builder";

/**
 * Mapping of dispute kit types to their respective commit builders.
 *
 * Each builder handles the construction of a transaction for the
 * specific dispute kit, including preparing ABI, functionName,
 * args.
 */
const builders: Record<DisputeKits, CommitBuilder> = {
  [DisputeKits.Classic]: classicCommitBuilder,
  [DisputeKits.Shutter]: shutterCommitBuilder,
  [DisputeKits.Gated]: gatedCommitBuilder,
  [DisputeKits.GatedShutter]: gatedShutterCommitBuilder,
  [DisputeKits.ArgentinaConsumerProtection]: argentinaConsumerProtectionCommitBuilder,
  [DisputeKits.ClassicUniversity]: classicUniversityCommitBuilder,
};

/**
 * Builds a commit transaction for a given dispute kit type.
 *
 * This function selects the correct commit builder based on
 * `params.disputeKitId` and calls its `build` method, passing the
 * caller-provided `params` and `context`. Dependencies are
 * automatically resolved via each builder's defaults.
 *
 * @param params  Parameters for the commit transaction. Must include
 *                a `disputeKitId` field corresponding to a `DisputeKits` value.
 * @param context Execution context, usually including chain info and
 *                account data required by the builder.
 *
 * @returns Returns transaction parameters (ABI, functionName, args, etc.) for call to the relevant DisputeKit
 */
export const buildCommitTxn = (params: CommitParams, context: CommitContext) => {
  return builders[params.disputeKitId].build(params, context);
};
