import { mergeTests } from "@playwright/test";

import { test as atlasTest } from "./atlas";
import { test as hardhatTest } from "./hardhat";
import { test as walletTest } from "./wallet";

export * from "@playwright/test";

// merge our custom fixtures, making them available for tests.
// We will re-use `test` from this file
export const test = mergeTests(walletTest, hardhatTest, atlasTest);
