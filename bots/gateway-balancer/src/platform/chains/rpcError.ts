import {
  BaseError,
  ContractFunctionRevertedError,
  ExecutionRevertedError,
  HttpRequestError,
  RawContractError,
  TimeoutError,
} from "viem";
import type { Hex } from "../../domain";
import type { Redact } from "../redact";

const HEX = /^0x[0-9a-fA-F]*$/;

function hexData(value: unknown): Hex | null {
  if (typeof value === "string" && HEX.test(value) && value.length > 2) return value as Hex;
  if (value && typeof value === "object" && "data" in value) return hexData((value as { data: unknown }).data);
  return null;
}

/**
 * Revert bytes anywhere in the error chain of a genuine contract revert (viem puts the node's `data` on the inner
 * `RpcRequestError`). Any other error (HTTP error, timeout, a node error such as a rate limit that carries a hex
 * `data` field) has none: its bytes are not revert data (decisions [L60]).
 */
export function findRevertData(error: unknown): Hex | null {
  if (!isExecutionRevert(error)) return null;
  let current: unknown = error;
  for (let depth = 0; current && depth < 16; depth++) {
    const found = hexData((current as { data?: unknown }).data) ?? hexData((current as { raw?: unknown }).raw);
    if (found) return found;
    current = (current as { cause?: unknown }).cause;
  }
  return null;
}

/** viem's `shortMessage` (never the URL or request body), or a plain error's message. */
export function shortMessage(error: unknown): string {
  if (error instanceof BaseError) return error.shortMessage;
  if (error instanceof Error) return error.message;
  return String(error);
}

/** The fixed revert suffix crossing the executor boundary: `revertData=0x<hex>` or `revertData=none`. */
export function revertSuffix(revertData: Hex | null): string {
  return `revertData=${revertData ?? "none"}`;
}

/**
 * True when the node executed the call and it reverted (with or without data): viem's `ExecutionRevertedError`
 * (JSON-RPC code 3 or an "execution reverted" node error) or `ContractFunctionRevertedError` anywhere in the chain.
 * A transport failure (HTTP error, timeout, refused connection) never matches, also when a 5xx body says "execution
 * reverted" (viem then builds an `ExecutionRevertedError` around the `HttpRequestError`; decisions [L70]).
 */
export function isExecutionRevert(error: unknown): boolean {
  if (!(error instanceof BaseError)) return false;
  if (error.walk((e) => e instanceof HttpRequestError || e instanceof TimeoutError)) return false;
  return Boolean(
    error.walk(
      (e) =>
        e instanceof ExecutionRevertedError ||
        e instanceof ContractFunctionRevertedError ||
        e instanceof RawContractError
    )
  );
}

/**
 * A plain `Error` (no cause, no viem metadata) with the short message and, for a contract revert, the fixed suffix
 * `revertData=0x<hex>` or `revertData=none` when the revert carried no bytes (decisions [L42]); a transport error
 * carries no marker. Passed through the redactor.
 */
export function plainRpcError(error: unknown, redact: Redact): Error {
  const message = isExecutionRevert(error)
    ? `${shortMessage(error)} ${revertSuffix(findRevertData(error))}`
    : shortMessage(error);
  return new Error(redact(message));
}
