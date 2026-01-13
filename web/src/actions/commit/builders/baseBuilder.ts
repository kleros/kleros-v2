import { Abi, type WriteContractParameters } from "viem";

import { CommitContext } from "../context";
import { CommitParams } from "../params";

/**
 * Canonical commit transaction type.
 */
export type CommitTx<TAbi extends Abi> = WriteContractParameters<TAbi>;

/**
 * Base builder interface
 */
export interface CommitBuilder<TParams extends CommitParams, TAbi extends Abi> {
  build(params: TParams, context: CommitContext): Promise<CommitTx<TAbi>>;
}
