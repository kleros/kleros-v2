import { defineActionBuilder } from "actions/helpers/builder";

import { VoteContext } from "../context";
import { VoteParams } from "../params";

/**
 * Typed factory for Vote action builders.
 *
 * This binds the generic {@link defineActionBuilder} helper to:
 * - {@link VoteParams}  – parameters supplied by the caller
 * - {@link VoteContext} – execution context (account, chain, wallet client)
 *
 *
 * Individual vote builders may still:
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
 * Vote actions do not require any shared or global dependencies, so an empty
 * object is provided as the default dependency set.
 * Using an explicit empty object here keeps the builder API consistent with
 * other action families (e.g. Commit) while making the absence of shared
 * dependencies intentional and documented.
 */
export const defineVoteBuilder = defineActionBuilder<VoteParams, VoteContext, object>({});

/**
 * Concrete VoteBuilder type produced by {@link defineVoteBuilder}.
 *
 * Each vote builder exposes a `build(params, context, deps?)` function that
 * returns a fully-typed transaction object ready to be executed.
 */
export type VoteBuilder = ReturnType<typeof defineVoteBuilder>;
