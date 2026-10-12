import { expect, test } from "../../fixtures";
import { selectCourt, selectDropdownOption } from "../../pages/dropdown";

const caseCards = (page: import("@playwright/test").Page) =>
  page.getByRole("link", { name: /^.+ #\d+ Case \d+ title/ });

test.describe("case list", () => {
  test("shows nine cases per page, newest first, and paginates", async ({ page }) => {
    await page.goto("/#/cases/display/1/desc/all");

    await expect(page.getByText(/^Total\s*12$/)).toBeVisible();
    await expect(page.getByText(/^In Progress\s*10$/)).toBeVisible();
    await expect(page.getByText(/^Closed\s*2$/)).toBeVisible();
    await expect(caseCards(page)).toHaveCount(9);
    await expect(caseCards(page).first()).toHaveAttribute("href", "#/cases/12");

    await page.getByRole("button", { name: "2", exact: true }).click();

    await expect(page).toHaveURL(/#\/cases\/display\/2\/desc\/all$/);
    await expect(caseCards(page)).toHaveCount(3);
    await expect(caseCards(page).first()).toHaveAttribute("href", "#/cases/3");
  });

  test("filters by status and queries the subgraph with that filter", async ({ page, subgraph }) => {
    await page.goto("/#/cases/display/1/desc/all");
    await expect(caseCards(page)).toHaveCount(9);

    await selectDropdownOption(page, "All Cases", "Closed");

    await expect(page).toHaveURL(/\/1\/desc\/%7B%22ruled%22%3Atrue%7D/);
    await expect(caseCards(page)).toHaveCount(2);
    await expect(caseCards(page).first()).toContainText(/Closed\s*#10/);
    expect(subgraph.calls).toContainEqual(
      expect.objectContaining({ field: "disputes", args: expect.objectContaining({ where: { ruled: true } }) })
    );
  });

  test("orders oldest first", async ({ page }) => {
    await page.goto("/#/cases/display/1/desc/all");
    await expect(caseCards(page).first()).toHaveAttribute("href", "#/cases/12");

    await selectDropdownOption(page, "Newest", "Oldest");

    await expect(page).toHaveURL(/#\/cases\/display\/1\/asc\//);
    await expect(caseCards(page).first()).toHaveAttribute("href", "#/cases/1");
  });

  test("searches by case id", async ({ page }) => {
    await page.goto("/#/cases/display/1/desc/all");
    await expect(caseCards(page)).toHaveCount(9);

    await page.getByRole("textbox", { name: "Search by ID" }).fill("7");

    await expect(caseCards(page)).toHaveCount(1);
    await expect(caseCards(page)).toHaveAttribute("href", "#/cases/7");
  });

  test("filters by court from the court selector", async ({ page }) => {
    await page.goto("/#/cases/display/1/desc/all");
    await expect(caseCards(page)).toHaveCount(9);

    await selectCourt(page, ["General Court", "Blockchain"]);

    await expect(page).toHaveURL(/%22court%22%3A%222%22/);
    await expect(caseCards(page)).toHaveCount(4);
    for (const card of await caseCards(page).all()) await expect(card).toContainText(/Court:\s*Blockchain/);
  });
});
