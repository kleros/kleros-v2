import { defineActionBuilder } from "actions/helpers/builder";

import { VoteContext } from "../context";
import { VoteParams } from "../params";

export const defineVoteBuilder = defineActionBuilder<VoteParams, VoteContext>();

export type VoteBuilder = ReturnType<typeof defineVoteBuilder>;
