import { defineActionBuilder } from "actions/helpers/builder";

import { CommitContext } from "../context";
import { CommitParams } from "../params";

export const defineCommitBuilder = defineActionBuilder<CommitParams, CommitContext>();

export type CommitBuilder = ReturnType<typeof defineCommitBuilder>;
