export * from "./populateTemplate";
export * from "./retrieveVariables";
export * from "./disputeDetailsTypes";

export const isUndefined = (maybeObject: any): maybeObject is undefined | null =>
  typeof maybeObject === "undefined" || maybeObject === null;
