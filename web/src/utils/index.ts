import { Roles } from "@kleros/kleros-app";

import { DEFAULT_CHAIN, getChain } from "consts/chains";

export const isUndefined = (maybeObject: any): maybeObject is undefined | null =>
  typeof maybeObject === "undefined" || maybeObject === null;

/**
 * Checks if a string is empty or contains only whitespace.
 */
export const isEmpty = (str: string): boolean => str.trim() === "";

export const getTxnExplorerLink = (hash: string) =>
  `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/tx/${hash}`;

type Role = {
  name: string;
  restriction: {
    maxSize: number;
    allowedMimeTypes: string[];
  };
};

export const getFileUploaderMsg = (role: Roles, roleRestrictions?: Role[]) => {
  if (!roleRestrictions) return;
  const restrictions = roleRestrictions.find((supportedRoles) => Roles[supportedRoles.name] === role);

  if (!restrictions) return;

  return `Allowed file types: [${restrictions.restriction.allowedMimeTypes.map((type) => type.split("/")?.[1] ?? null).join(", ")}], Max allowed size: ${(restrictions.restriction.maxSize / (1024 * 1024)).toFixed(2)} MB.`;
};
