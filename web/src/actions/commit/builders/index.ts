import { DisputeKits } from "src/consts";

import { CommitContext } from "../context";
import { CommitParams } from "../params";

import { CommitBuilder } from "./baseBuilder";
import { classicCommitBuilder } from "./classic.builder";
import { gatedCommitBuilder } from "./gated.builder";
import { gatedShutterCommitBuilder } from "./gatedShutter.builder";
import { shutterCommitBuilder } from "./shutter.builder";

const builders: Record<DisputeKits, CommitBuilder> = {
  [DisputeKits.Classic]: classicCommitBuilder,
  [DisputeKits.Shutter]: shutterCommitBuilder,
  [DisputeKits.Gated]: gatedCommitBuilder,
  [DisputeKits.GatedShutter]: gatedShutterCommitBuilder,
};

export const buildCommitTxn = (params: CommitParams, context: CommitContext) => {
  return builders[params.type].build(params, context);
};
