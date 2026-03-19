import { mergeTests } from "@playwright/test";

import { test as atlasTest } from "./atlas";
import { test as timeTest } from "./time";
import { test as walletTest } from "./wallet";

export * from "@playwright/test";
export { TimeFixture } from "./time";
export type { HardhatClient } from "./hardhat";

// merge our custom fixtures, making them available for tests.
// We will re-use `test` from this file
// Note: timeTest already extends hardhatTest, so we don't need to include hardhatTest separately
export const test = mergeTests(walletTest, atlasTest, timeTest);
