import { aUser } from "../../builders/subgraph";
import { expect, test } from "../../fixtures";

const jurorAddress = (i: number) => `0x30000000000000000000000000000000000000${String(i).padStart(2, "0")}`;

test.describe("jurors leaderboard", () => {
  test.beforeEach(async ({ subgraph }) => {
    subgraph.world.users = Array.from({ length: 12 }, (_, i) =>
      aUser(jurorAddress(i + 1), {
        coherenceScore: String(100 - i),
        totalResolvedVotes: "10",
        totalCoherentVotes: String(10 - Math.floor(i / 2)),
        totalResolvedDisputes: "10",
      })
    );
    subgraph.world.counter = { totalLeaderboardJurors: "12" };
  });

  const rows = (page: import("@playwright/test").Page) => page.getByRole("link", { name: /^0x3000\.\.\.00\d\d$/ });

  test("ranks jurors by score and paginates by ten", async ({ page }) => {
    await page.goto("/#/jurors/1/desc/all");

    await expect(rows(page)).toHaveCount(10);
    await expect(rows(page).first()).toHaveText("0x3000...0001");

    await page.getByRole("button", { name: "2", exact: true }).click();

    await expect(page).toHaveURL(/#\/jurors\/2\/desc\/all/);
    await expect(rows(page)).toHaveText(["0x3000...0011", "0x3000...0012"]);
  });

  test("finds a juror by address", async ({ page, subgraph }) => {
    await page.goto("/#/jurors/1/desc/all");
    await expect(rows(page)).toHaveCount(10);

    await page.getByRole("textbox", { name: "Search by address" }).fill(jurorAddress(7));

    await expect(rows(page)).toHaveText(["0x3000...0007"]);
    expect(subgraph.calls).toContainEqual(
      expect.objectContaining({
        field: "users",
        args: expect.objectContaining({ where: expect.objectContaining({ userAddress_contains: jurorAddress(7) }) }),
      })
    );
  });

  test("links each juror to their profile", async ({ page }) => {
    await page.goto("/#/jurors/1/desc/all");

    await rows(page).first().click();

    await expect(page).toHaveURL(new RegExp(`profile/stakes/1\\?address=${jurorAddress(1)}`));
  });
});
