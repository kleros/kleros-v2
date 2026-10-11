import type { Round } from "src/graphql/graphql";

import type { Fake } from "../../builders/types";
import { disputeKitClassic } from "../../contracts";
import { expect, test } from "../../fixtures";
import { ALICE, drawJuror } from "../../mocks/subgraph/world";

test.describe("voting as a drawn juror", () => {
  test("casts a public vote with a justification", async ({ page, wallet, rpc, subgraph }) => {
    drawJuror(subgraph.world, "3", ALICE, 4);
    rpc.onCall(disputeKitClassic, "castVote", () => undefined);
    await page.goto("/#/cases/3/voting");
    await wallet.connect("alice");

    await page.getByRole("textbox", { name: "editable markdown" }).fill("The seller delivered on time.");
    await page.getByRole("button", { name: "Yes", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Confirm your vote" })).toBeVisible();
    await page.getByRole("button", { name: "Confirm vote" }).click();

    await expect(page.getByText("Thanks for voting")).toBeVisible();
    // castVote(disputeId, voteIDs, choice, salt = 0 for public votes, justification)
    expect(rpc.sent(disputeKitClassic, "castVote").map((tx) => tx.args)).toEqual([
      [3n, [4n], 1n, 0n, "The seller delivered on time."],
    ]);
  });

  test("commits a hidden vote as a hash", async ({ page, wallet, rpc, subgraph }) => {
    drawJuror(subgraph.world, "2", ALICE, 1);
    (subgraph.world.disputes[1].currentRound as Fake<Round>).hiddenVotes = true;
    rpc.onCall(disputeKitClassic, "castCommit", () => undefined);
    await page.goto("/#/cases/2/voting");
    await wallet.connect("alice");

    await page.getByRole("button", { name: "No", exact: true }).click();
    await page.getByRole("button", { name: "Confirm vote" }).click();

    await expect(page.getByText("Thanks for voting")).toBeVisible();
    const [commit] = rpc.sent(disputeKitClassic, "castCommit");
    expect(commit.args.slice(0, 2)).toEqual([2n, [1n]]);
    expect(commit.args[2]).toMatch(/^0x[0-9a-f]{64}$/);
  });

  test("tells a juror who was not drawn", async ({ page, wallet }) => {
    await page.goto("/#/cases/3/voting");
    await wallet.connect("alice");

    await expect(page.getByText("You were not drawn in current round.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Yes", exact: true })).toBeHidden();
  });
});
