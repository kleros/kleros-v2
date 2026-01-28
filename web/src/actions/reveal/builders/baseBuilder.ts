import { defineActionBuilder } from "actions/helpers/builder";

import { RevealContext } from "../context";
import { RevealParams } from "../params";

export const defineRevealBuilder = defineActionBuilder<RevealParams, RevealContext>();

export type RevealBuilder = ReturnType<typeof defineRevealBuilder>;
