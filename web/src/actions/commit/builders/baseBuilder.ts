import { defineActionBuilder } from "actions/helpers/builder";

import { CommitContext } from "../context";
import { CommitBuilderDeps, defaultCommitBuilderDeps } from "../deps";
import { CommitParams } from "../params";

/**
 * Typed factory for Commit action builders.
 *
 * This binds the generic {@link defineActionBuilder} helper to:
 * - {@link CommitParams}   – parameters supplied by the caller (UI / app logic)
 * - {@link CommitContext}  – execution context (account, chain, wallet client)
 * - {@link CommitBuilderDeps} – full dependency set required by commit builders
 *
 * {@link defaultCommitBuilderDeps} are provided here as the **global default
 * dependencies** for all commit builders. These typically include shared
 * dependencies such as storage helpers or crypto utilities.
 *
 * Individual commit builders may:
 * - Declare additional builder-specific defaults via `builderDeps`
 *   (e.g. shutter specific encryption helpers)
 * - Override any default dependency if required
 *
 * Callers (including tests) may further override dependencies at build time
 * by passing a partial dependency object to `builder.build(...)`.
 *
 * Dependency resolution order (last one takes precedence):
 * 1. Global defaults defined here
 * 2. Builder-level defaults (`builder.builderDeps`)
 * 3. Call-site overrides passed to `build(...)`
 */
export const defineCommitBuilder = defineActionBuilder<CommitParams, CommitContext, CommitBuilderDeps>(
  defaultCommitBuilderDeps
);

/**
 * Concrete CommitBuilder type produced by {@link defineCommitBuilder}.
 *
 * Each commit builder exposes a `build(params, context, deps?)` function
 * that returns a fully-typed transaction object ready to be submitted via
 * a wallet client.
 */
export type CommitBuilder = ReturnType<typeof defineCommitBuilder>;
