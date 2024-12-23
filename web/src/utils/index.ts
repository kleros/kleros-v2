import { DEFAULT_CHAIN, getChain } from "consts/chains";

export const isUndefined = (maybeObject: any): maybeObject is undefined | null =>
  typeof maybeObject === "undefined" || maybeObject === null;

/**
 * Checks if a string is empty or contains only whitespace.
 */
export const isEmpty = (str: string): boolean => str.trim() === "";

export const getTxnExplorerLink = (hash: string) =>
  `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/tx/${hash}`;
