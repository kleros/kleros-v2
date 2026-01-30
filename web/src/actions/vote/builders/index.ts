import { DisputeKits } from "src/consts";

import { VoteContext } from "../context";
import { VoteParams } from "../params";

import { VoteBuilder } from "./baseBuilder";
import { classicVoteBuilder } from "./classic.builder";
import { gatedVoteBuilder } from "./gated.builder";
import { gatedShutterVoteBuilder } from "./gatedShutter.builder";
import { shutterVoteBuilder } from "./shutter.builder";

/**
 * Mapping of dispute kit types to their respective vote builders.
 *
 * Each builder handles the construction of a transaction for the
 * specific dispute kit, including preparing ABI, functionName,
 * args.
 *
 * @remarks Non hidden votes are same signature among kits
 */
const builders: Record<DisputeKits, VoteBuilder> = {
  [DisputeKits.Classic]: classicVoteBuilder,
  [DisputeKits.Gated]: gatedVoteBuilder,
  [DisputeKits.Shutter]: shutterVoteBuilder,
  [DisputeKits.GatedShutter]: gatedShutterVoteBuilder,
};

/**
 * Builds a vote transaction for a given dispute kit type.
 *
 * This function selects the correct vote builder based on
 * `params.type` and calls its `build` method, passing the
 * caller-provided `params` and `context`. Dependencies are
 * automatically resolved via each builder's defaults.
 *
 * @param params  Parameters for the vote transaction. Must include
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
export const buildVoteTxn = (params: VoteParams, context: VoteContext) => {
  return builders[params.type].build(params, context);
};
