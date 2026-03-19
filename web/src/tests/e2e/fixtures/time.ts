import type { Page } from "@playwright/test";

import { test as hardhatTest, type HardhatClient } from "./hardhat";

/**
 * TimeFixture provides methods to control and sync time between
 * the browser and the Hardhat chain.
 */
export class TimeFixture {
  private page: Page;
  private hardhat: HardhatClient;
  private initialized = false;

  constructor({ page, hardhat }: { page: Page; hardhat: HardhatClient }) {
    this.page = page;
    this.hardhat = hardhat;
  }

  /**
   * Initialize the clock with the current hardhat block timestamp.
   * Must be called before navigating to pages that depend on time.
   * This installs Playwright's fake timers and syncs with hardhat.
   */
  async install() {
    const hardhatTime = (await this.getHardhatTime()) * 1000;

    await this.page.clock.install({ time: hardhatTime });
    this.initialized = true;
  }

  /**
   * Set both browser and hardhat time to a specific timestamp.
   * @param timestamp - Unix timestamp in seconds (same as hardhat)
   */
  async setTime(timestamp: number) {
    await this.hardhat.setNextBlockTimestamp({ timestamp: BigInt(timestamp) });
    // The node currently is set to auto mine on an interval, but we intentionally mine to sync time.
    await this.hardhat.mine({ blocks: 1 });

    // setting browser time
    const timeMs = timestamp * 1000;
    if (this.initialized) {
      await this.page.clock.setFixedTime(timeMs);
    } else {
      await this.page.clock.install({ time: timeMs });
      this.initialized = true;
    }
  }

  /**
   * Advance both browser and hardhat time by the specified duration.
   * @param seconds - Number of seconds to advance
   */
  async advanceTime(seconds: number) {
    await this.hardhat.increaseTime({ seconds });
    await this.hardhat.mine({ blocks: 1 });

    const newTimeMs = (await this.getHardhatTime()) * 1000;

    if (this.initialized) {
      await this.page.clock.setFixedTime(newTimeMs);
    } else {
      await this.page.clock.install({ time: newTimeMs });
      this.initialized = true;
    }
  }

  /**
   * Sync browser time with current hardhat block timestamp.
   * Useful after external hardhat time changes.
   */
  async sync() {
    const hardhatTimeMs = (await this.getHardhatTime()) * 1000;

    if (this.initialized) {
      await this.page.clock.setFixedTime(hardhatTimeMs);
    } else {
      await this.page.clock.install({ time: hardhatTimeMs });
      this.initialized = true;
    }
  }

  /**
   * Fast-forward browser time by the specified milliseconds.
   * This runs pending timers but doesn't affect hardhat time.
   * Use advanceTime() to advance both.
   * @param ms - Milliseconds to fast-forward
   */
  async fastForwardBrowser(ms: number) {
    if (!this.initialized) {
      await this.install();
    }
    await this.page.clock.fastForward(ms);
  }

  /**
   * Get current hardhat block timestamp in seconds.
   */
  async getHardhatTime() {
    const block = await this.hardhat.getBlock();
    return Number(block.timestamp);
  }

  /**
   * Mine a specified number of blocks on hardhat and sync browser time.
   * @param blocks - Number of blocks to mine
   */
  async mineBlocks(blocks: number) {
    await this.hardhat.mine({ blocks });
    await this.sync();
  }
}

// Extend the hardhat test to include the time fixture
// This way the time fixture has access to the hardhat client from the hardhat fixture
export const test = hardhatTest.extend<{ time: TimeFixture }>({
  time: async ({ page, hardhat }, use) => {
    await use(new TimeFixture({ page, hardhat }));
  },
});
