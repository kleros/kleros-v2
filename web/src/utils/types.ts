/**
 * Typescript Omit when applied over union types, squashes the properties
 * This helper type helps keep the original structure, and applies Omit distributively
 */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/**
 *  Takes a Type and makes the provided key optional
 */
export type PartialBy<T, K extends keyof T> = DistributiveOmit<T, K> & Partial<Pick<T, K>>;
