import { Abi, ContractFunctionName, WriteContractParameters } from "viem";

export type ActionTx<TAbi extends Abi, TFn extends ContractFunctionName<TAbi>> = WriteContractParameters<TAbi, TFn>;

export interface ActionBuilder<TParams, TContext, TDeps, TAbi extends Abi, TFn extends ContractFunctionName<TAbi>> {
  /**
   * Builder-level dependency defaults.
   *
   * Allows a specific builder to:
   * - Provide defaults for dependencies it uniquely requires
   *   (e.g. an `encrypt` helper used only by shutter builders)
   * - Override any global default dependency if necessary
   *   (e.g. a specialized storage implementation)
   *
   * These dependencies are shallow-merged with the global defaults
   * and any call-site overrides at build time.
   *
   * Call-site overrides passed to `build(...)` always take precedence.
   */
  builderDeps?: Partial<TDeps>;
  build(params: TParams, context: TContext, deps: TDeps): Promise<ActionTx<TAbi, TFn>>;
}

/**
 * Typed action builder factory.
 *
 * This helper fixes the `params`, `context`, and `deps` types for a family of
 * action builders, so individual builders only need to specify the contract ABI
 * and function name, which also inferred from return object of builder.build.
 *
 * Dependency resolution happens at build time via a shallow merge, in the
 * following order (later entries take precedence):
 *
 * 1. Global default dependencies provided to this factory
 * 2. Builder-level default dependencies (`builder.builderDeps`)
 * 3. Call-site dependency overrides passed to `build(...)`
 *
 * This allows:
 * - Shared builder dependencies to be defined once globally
 * - Individual builders to declare or override defaults for their own needs
 * - Callers (e.g. tests) to selectively override any dependency
 *
 * The resolved dependency object is guaranteed (at the type level) to satisfy
 * `TDeps` and is passed to the builder implementation as a fully populated
 * dependency set.
 *
 * @typeParam TParams   Parameters coming from the caller (usually UI input)
 * @typeParam TContext  Execution context (e.g. chain, account)
 * @typeParam TDeps     Dependency set for the builder (storage, etc.)
 *
 * @param defaultDeps   Global default dependencies shared by all builders
 *
 * @returns A function that accepts a builder definition and returns an object
 *          exposing a `build` function with dependency resolution applied.
 */
export function defineActionBuilder<TParams, TContext, TDeps extends object>(defaultDeps: TDeps) {
  return function <TAbi extends Abi, TFn extends ContractFunctionName<TAbi>>(
    builder: ActionBuilder<TParams, TContext, TDeps, TAbi, TFn>
  ) {
    return {
      build(params: TParams, context: TContext, overrideDeps?: Partial<TDeps>) {
        const resolvedDeps = {
          ...defaultDeps,
          ...builder?.builderDeps,
          ...overrideDeps,
        } satisfies TDeps;

        return builder.build(params, context, resolvedDeps);
      },
    };
  };
}
