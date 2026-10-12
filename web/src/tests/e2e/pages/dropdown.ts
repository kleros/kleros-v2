import type { Page } from "@playwright/test";

/** Picks an option of a ui-components-library DropdownSelect (a react-aria Select: trigger button + listbox). */
export const selectDropdownOption = async (page: Page, current: string | RegExp, option: string) => {
  await page.getByRole("button", { name: current }).click();
  await page.getByRole("listbox").getByRole("option", { name: option, exact: true }).click();
};

/**
 * Walks a DropdownCascader court tree (e.g. ["General Court", "Blockchain"]) and confirms the last court.
 * The tree is a treegrid: each parent is expanded with its "Expand <court>" button, the last row is selected.
 */
export const selectCourt = async (page: Page, path: string[], trigger: string | RegExp = "Select Court") => {
  await page.getByRole("button", { name: trigger }).click();
  const tree = page.getByRole("treegrid", { name: "dropdown-selection" });
  for (const court of path.slice(0, -1))
    await tree.getByRole("button", { name: `Expand ${court}`, exact: true }).click();
  await tree.getByRole("row", { name: path.at(-1), exact: true }).click();
  await page.getByRole("button", { name: `Select ${path.at(-1)}`, exact: true }).click();
};
