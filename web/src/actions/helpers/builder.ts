import { Abi, ContractFunctionName, WriteContractParameters } from "viem";

export type ActionTx<TAbi extends Abi, TFn extends ContractFunctionName<TAbi>> = WriteContractParameters<TAbi, TFn>;

export interface ActionBuilder<TParams, TAbi extends Abi, TFn extends ContractFunctionName<TAbi>, TContext> {
  build(params: TParams, context: TContext): Promise<ActionTx<TAbi, TFn>>;
}

/**
 * Generic builder factory. Builds a type-casted builder for a given action type
 * Provide TParams and TContext once for a given action type.
 * Then individual builders only supply ABI and functionName.
 */
export function defineActionBuilder<TParams, TContext>() {
  return function <TAbi extends Abi, TFn extends ContractFunctionName<TAbi>>(
    builder: ActionBuilder<TParams, TAbi, TFn, TContext>
  ): ActionBuilder<TParams, TAbi, TFn, TContext> {
    return builder;
  };
}
