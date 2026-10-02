import type { CreatePlatform } from "../ports";

/**
 * Platform lane: config and secrets, logger, journal (node:sqlite), chain clients, executor, reconciliation,
 * notifier, health.
 */
export const createPlatform: CreatePlatform = async () => {
  throw new Error("platform lane: createPlatform is not implemented yet");
};
