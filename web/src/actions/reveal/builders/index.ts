import { DisputeKits } from "src/consts";

import { RevealContext } from "../context";
import { RevealParams } from "../params";

import { RevealBuilder } from "./baseBuilder";
import { classicRevealBuilder } from "./classic.builder";
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
};

/**
 * Builds a reveal transaction for a given dispute kit type.
 *
 * This function selects the correct reveal builder based on
 * `params.type` and calls its `build` method, passing the
 * caller-provided `params` and `context`. Dependencies are
 * automatically resolved via each builder's defaults.
 *
 * @param params  Parameters for the reveal transaction. Must include
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
export const buildRevealTxn = (params: RevealParams, context: RevealContext) => {
  return builders[params.type].build(params, context);
};
