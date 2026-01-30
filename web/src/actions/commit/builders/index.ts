import { DisputeKits } from "src/consts";

import { CommitContext } from "../context";
import { CommitParams } from "../params";

import { CommitBuilder } from "./baseBuilder";
import { classicCommitBuilder } from "./classic.builder";
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
};

/**
 * Builds a commit transaction for a given dispute kit type.
 *
 * This function selects the correct commit builder based on
 * `params.type` and calls its `build` method, passing the
 * caller-provided `params` and `context`. Dependencies are
 * automatically resolved via each builder's defaults.
 *
 * @param params  Parameters for the commit transaction. Must include
 *                a `type` field corresponding to a `DisputeKits` value.
 * @param context Execution context, usually including chain info and
 *                account data required by the builder.
 *
 * @returns A promise that resolves to an object containing:
 *          - `account`: the account performing the transaction
 *          - `address`: the contract address
 *          - `abi`: the contract ABI
 *          - `functionName`: the function to call
 *          - `args`: the arguments for the function
 *          - `chain`: the chain info
 */
export const buildCommitTxn = (params: CommitParams, context: CommitContext) => {
  return builders[params.type].build(params, context);
};
