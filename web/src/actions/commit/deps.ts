import { encrypt } from "utils/crypto/shutter";

import { storeCommitData } from "../helpers/storage";

/**
 * Provides dependencies for commit builders.
 *
 * This interface enables dependency injection so implementations can be
 * customized or replaced if needed.
 *
 * @remarks
 * Builder-specific dependencies should extend this interface rather than modifying it.
 */
interface BaseCommitBuilderDeps {
  storeCommitData: typeof storeCommitData;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ClassicCommitDeps extends BaseCommitBuilderDeps {}

export interface ShutterCommitDeps extends BaseCommitBuilderDeps {
  encrypt: typeof encrypt;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GatedCommitDeps extends BaseCommitBuilderDeps {}

export interface GatedShutterCommitDeps extends BaseCommitBuilderDeps {
  encrypt: typeof encrypt;
}

export type CommitBuilderDeps = ClassicCommitDeps | ShutterCommitDeps | GatedCommitDeps | GatedShutterCommitDeps;
export const defaultCommitBuilderDeps: BaseCommitBuilderDeps = {
  storeCommitData,
};
