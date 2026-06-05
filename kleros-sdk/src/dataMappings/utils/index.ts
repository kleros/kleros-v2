export * from "./populateTemplate";
export * from "./retrieveVariables";
export * from "./disputeDetailsTypes";

export const isUndefined = (maybeObject: unknown): maybeObject is undefined | null =>
  typeof maybeObject === "undefined" || maybeObject === null;
