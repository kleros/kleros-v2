export const isUndefined = (maybeObject: any): maybeObject is undefined | null =>
  typeof maybeObject === "undefined" || maybeObject === null;
