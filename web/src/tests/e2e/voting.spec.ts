import { RefuseToArbitrateAnswer } from "@kleros/kleros-sdk";

import { expect, test } from "./fixtures";
import { DISPUTE_SCENARIOS, passToPhase, setupCase, setupStake, SortitionPhase } from "./utils";
import { executeRulingForDispute, drawJurors, passPeriod } from "./utils/dispute";

// TODO: add support for DK specific flow and support for hiddenVotes
test.describe("Voting tests", () => {
  let disputeId: bigint | null = null;

  test.beforeEach(async ({ page, wallet, hardhat, time }) => {
    await page.goto("/");
    // note that alice being the first account and deployer already has the PNK
    await wallet.connect("alice");

    // Alice stakes in general court
    await setupStake(hardhat, time, "alice");

    const disputeRes = await setupCase(hardhat, "alice", DISPUTE_SCENARIOS.simple);
    disputeId = disputeRes.disputeId;

    expect(disputeId).toBeDefined();

    await passToPhase(hardhat, time, SortitionPhase.Drawing);

    // Alice staked above, will be drawn with this
    await drawJurors(hardhat, disputeId!);

    // pass period to commit/voting
    await passPeriod(hardhat, time, disputeId!);
  });

  test("should allow alice to vote", async ({ page, hardhat, time }) => {
    // making sure the case was created
    expect(disputeId).toBeDefined();

    await page.goto(`/#/cases/${disputeId}/overview`);

    await expect(page.getByText(`Case #${disputeId}`)).toBeVisible({ timeout: 30_000 });

    // go to Votes Tab
    await page.getByRole("button", { name: "Votes" }).click();

    const optionOneName = DISPUTE_SCENARIOS.simple.answers[0].title;
    const optionTwoName = DISPUTE_SCENARIOS.simple.answers[1].title;

    // checking that options are available
    await expect(page.getByRole("button", { name: optionOneName })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: optionTwoName })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: RefuseToArbitrateAnswer.title })).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: optionOneName }).click();

    // confirmation modal shown before committing the vote
    const confirmVoteModal = page.getByRole("dialog");
    await expect(confirmVoteModal.getByText("Confirm your vote")).toBeVisible({ timeout: 30_000 });
    await expect(confirmVoteModal.getByText(optionOneName)).toBeVisible();
    await confirmVoteModal.getByRole("button", { name: "Confirm vote" }).click();

    // popup after committing
    await expect(page.getByText("Thanks for voting")).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Close", exact: true }).click();

    // passing to vote period
    await passPeriod(hardhat, time, disputeId!);

    // vote/ reveal vote
    await page.getByLabel("editable markdown").fill("Test description");
    // NOTE: this will ask for signature to reveal and then reveal/vote
    await page.getByRole("button", { name: "Justify & Reveal" }).click();

    // passing to appeal period
    await passPeriod(hardhat, time, disputeId!);

    // passing to execution period
    await passPeriod(hardhat, time, disputeId!);

    await executeRulingForDispute(hardhat, disputeId!);

    // going to Overview Tab
    await page.getByRole("button", { name: "Overview" }).click();

    await expect(page.getByText("Case Closed")).toBeVisible({ timeout: 30_000 });
  });
});
