import { DisputeKits } from "src/consts";

import { RevealContext } from "../context";
import { RevealParams } from "../params";

import { RevealBuilder } from "./baseBuilder";
import { classicRevealBuilder } from "./classic.builder";
import { gatedRevealBuilder } from "./gated.builder";
import { gatedShutterRevealBuilder } from "./gatedShutter.builder";
import { shutterRevealBuilder } from "./shutter.builder";

const builders: Record<DisputeKits, RevealBuilder> = {
  [DisputeKits.Classic]: classicRevealBuilder,
  [DisputeKits.Shutter]: shutterRevealBuilder,
  [DisputeKits.Gated]: gatedRevealBuilder,
  [DisputeKits.GatedShutter]: gatedShutterRevealBuilder,
};

export const buildRevealTxn = (params: RevealParams, context: RevealContext) => {
  return builders[params.type].build(params, context);
};
