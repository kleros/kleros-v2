import type { Topology } from "../config/schema";
import type { Address, ChainId } from "../domain";
import type { ChainClient, RecoveryReport, SubmitOutcome, TxExecutor } from "../ports";

function unavailable(what: string): never {
  throw new Error(`${what} is not available in the read-only status command`);
}

/** A chain client for `status`: constructible without an RPC URL; every method throws when called. */
export function inertChainClient(chainId: ChainId): ChainClient {
  const fail = (method: string) => async (): Promise<never> => unavailable(`chain ${chainId}: ${method}`);
  return {
    chainId,
    getBlockNumber: fail("getBlockNumber"),
    getNativeBalance: fail("getNativeBalance"),
    getErc20Balance: fail("getErc20Balance"),
    getCode: fail("getCode"),
    readContract: fail("readContract"),
    estimateGas: fail("estimateGas"),
    getTransactionReceipt: fail("getTransactionReceipt"),
    getTransaction: fail("getTransaction"),
    getTransactionCount: fail("getTransactionCount"),
  };
}

export function inertChainClients(topology: Topology): Map<ChainId, ChainClient> {
  return new Map(topology.chains.map((chain) => [chain.id, inertChainClient(chain.id)]));
}

/** An executor for `status`: never signs; every method throws when called. */
export function inertExecutor(signer: Address): TxExecutor {
  return {
    signer,
    submit: async (): Promise<SubmitOutcome> => unavailable("executor.submit"),
    resolve: async (): Promise<SubmitOutcome | undefined> => unavailable("executor.resolve"),
    recover: async (): Promise<RecoveryReport> => unavailable("executor.recover"),
  };
}
