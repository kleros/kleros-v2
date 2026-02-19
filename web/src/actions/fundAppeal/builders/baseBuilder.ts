import { defineActionBuilder } from "actions/helpers/builder";

import { FundAppealContext } from "../context";
import { FundAppealParams } from "../params";

/**
 * Typed factory for Fund appeal action builders.
 *
 * This binds the generic {@link defineActionBuilder} helper to:
 * - {@link FundAppealParams}  – parameters supplied by the caller
 * - {@link FundAppealContext} – execution context (account, chain, wallet client)
 *
 *
 * Individual fund appeal builders may still:
 * - Define their own builder-level defaults via `builderDeps`
 * - Accept call-site dependency overrides for testing or specialization
 *
 * Callers (including tests) may further override dependencies at build time
 * by passing a partial dependency object to `builder.build(...)`.
 *
 * Dependency resolution order (last one takes precedence):
 * 1. Global defaults defined here
 * 2. Builder-level defaults (`builder.builderDeps`)
 * 3. Call-site overrides passed to `build(...)`
 *
 * @remarks
 * Fund appeal actions do not require any shared or global dependencies, so an empty
 * object is provided as the default dependency set.
 * Using an explicit empty object here keeps the builder API consistent with
 * other action families (e.g. Commit) while making the absence of shared
 * dependencies intentional and documented.
 */
export const defineFundAppealBuilder = defineActionBuilder<FundAppealParams, FundAppealContext, object>({});

/**
 * Concrete FundAppealBuilder type produced by {@link defineFundAppealBuilder}.
 *
 * Each fundAppeal builder exposes a `build(params, context, deps?)` function that
 * returns a fully-typed transaction object ready to be executed.
 */
export type FundAppealBuilder = ReturnType<typeof defineFundAppealBuilder>;
