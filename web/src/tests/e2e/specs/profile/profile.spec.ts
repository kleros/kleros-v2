import { parseEther } from "viem";

import { aStake, aUser } from "../../builders/subgraph";
import { pnk } from "../../builders/types";
import { sortitionModule } from "../../contracts";
import { expect, test } from "../../fixtures";
import { ALICE, drawJuror } from "../../mocks/subgraph/world";

test.describe("juror profile", () => {
  test.beforeEach(async ({ subgraph, rpc }) => {
    const { world } = subgraph;
    const [general, blockchain] = world.courts;
    const alice = aUser(ALICE, {
      totalDisputes: "2",
      totalResolvedDisputes: "1",
      totalResolvedVotes: "4",
      totalCoherentVotes: "3",
      coherenceScore: "75",
    });
    world.users.push(alice);
    world.stakes.push(aStake(alice, general, pnk(2_000)), aStake(alice, blockchain, pnk(500)));
    alice.tokens = world.stakes.filter((s) => s.juror === alice);
    alice.disputes = [world.disputes[2], world.disputes[4]];
    drawJuror(world, "3", ALICE, 0);
    drawJuror(world, "5", ALICE, 1);
    alice.draws = world.draws.filter((d) => d.juror === alice);
    rpc.onCall(
      sortitionModule,
      "getJurorBalance",
      () => [parseEther("2500"), parseEther("100"), parseEther("2000"), 2n] as const
    );
  });

  test("shows the connected juror's current stakes per court", async ({ page, wallet }) => {
    await page.goto("/");
    await wallet.connect("alice");
    await page.goto("/#/profile/stakes/1");

    await expect(page.getByRole("heading", { name: "Current Stakes" })).toBeVisible();
    await expect(page.getByText(/Total Available Stake:\s*2,500 PNK/)).toBeVisible();
    await expect(page.getByText(/Locked Stake:\s*100 PNK/)).toBeVisible();
    await expect(page.getByRole("link", { name: /General Court/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Blockchain/ })).toBeVisible();
  });

  test("lists the cases the juror was drawn in", async ({ page, wallet }) => {
    await page.goto("/");
    await wallet.connect("alice");
    await page.goto("/#/profile/cases/1/desc/all");

    await expect(page.getByRole("heading", { name: "Cases Drawn" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Case \d+ title/ })).toHaveCount(2);
  });

  test("lists the juror's votes", async ({ page, wallet }) => {
    await page.goto("/");
    await wallet.connect("alice");
    await page.goto("/#/profile/votes/1/desc/all");

    await expect(page.getByRole("heading", { name: "Votes", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Case \d+$/ })).toHaveText(["Case 5", "Case 3"]);
    await expect(page.getByRole("link", { name: "View vote" }).first()).toHaveAttribute("href", "#/cases/5/voting");
  });

  test("opens another juror's profile from the address query", async ({ page }) => {
    await page.goto("/#/profile/stakes/1?address=0x1000000000000000000000000000000000000001");

    await expect(page.getByText("Coherent Votes: 9/10")).toBeVisible();
  });
});
