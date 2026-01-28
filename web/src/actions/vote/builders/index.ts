import { DisputeKits } from "src/consts";

import { VoteContext } from "../context";
import { VoteParams } from "../params";

import { VoteBuilder } from "./baseBuilder";
import { classicVoteBuilder } from "./classic.builder";

// Non hidden votes are same signature among kits
const builders: Record<DisputeKits, VoteBuilder> = {
  [DisputeKits.Classic]: classicVoteBuilder,
  [DisputeKits.Gated]: classicVoteBuilder,
  [DisputeKits.Shutter]: classicVoteBuilder,
  [DisputeKits.GatedShutter]: classicVoteBuilder,
};

export const buildVoteTxn = (params: VoteParams, context: VoteContext) => {
  return builders[params.type].build(params, context);
};
