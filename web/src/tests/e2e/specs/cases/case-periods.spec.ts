import { expect, test } from "../../fixtures";

// Default world: dispute N is in PERIODS[(N - 1) % 5].
const CASES = [
  {
    id: "1",
    period: "evidence",
    status: "Case in progress",
    detail: /Voting Starts|Voting is ongoing/,
    appealTab: false,
  },
  { id: "2", period: "commit", status: "Case in progress", detail: "Voting is ongoing", appealTab: false },
  { id: "3", period: "vote", status: "Case in progress", detail: "Voting is ongoing", appealTab: false },
  {
    id: "4",
    period: "appeal",
    status: "Case in progress",
    detail: "remaining to fund losing options",
    appealTab: true,
  },
  {
    id: "5",
    period: "execution",
    status: "Case closed",
    detail: /The jury decided in favor of:\s*Yes/,
    appealTab: true,
  },
];

test.describe("case overview across periods", () => {
  for (const { id, period, status, detail, appealTab } of CASES) {
    test(`shows the ${period} period state`, async ({ page }) => {
      await page.goto(`/#/cases/${id}/overview`);

      await expect(page.getByRole("heading", { name: `Case #${id}` })).toBeVisible();
      await expect(page.getByRole("heading", { name: `Case ${id} title` })).toBeVisible();
      await expect(page.getByText(status, { exact: true })).toBeVisible();
      await expect(page.getByText(detail).first()).toBeVisible();
      const appeal = page.getByRole("tab", { name: "Appeal", exact: true });
      if (appealTab) await expect(appeal).toBeEnabled();
      else await expect(appeal).toBeDisabled();
    });
  }

  test("switches between the case tabs", async ({ page }) => {
    await page.goto("/#/cases/4/overview");

    await page.getByRole("tab", { name: "Evidence", exact: true }).click();
    await expect(page).toHaveURL(/#\/cases\/4\/evidence$/);
    await expect(page.getByText("There is no evidence submitted yet")).toBeVisible();

    await page.getByRole("tab", { name: "Votes", exact: true }).click();
    await expect(page).toHaveURL(/#\/cases\/4\/voting$/);
    await expect(page.getByRole("heading", { name: "Voting History" })).toBeVisible();

    await page.getByRole("tab", { name: "Appeal", exact: true }).click();
    await expect(page).toHaveURL(/#\/cases\/4\/appeal$/);
    await expect(page.getByRole("heading", { name: "Appeal crowdfunding" })).toBeVisible();
  });
});
