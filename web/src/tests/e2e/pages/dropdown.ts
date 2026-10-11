import type { Page } from "@playwright/test";

/**
 * Picks an option of a ui-components-library DropdownSelect. Its options render as paragraphs inside an
 * OverlayScrollbars region, not as ARIA options.
 */
export const selectDropdownOption = async (page: Page, current: string | RegExp, option: string) => {
  await page.getByRole("button", { name: current }).click();
  await page.getByRole("region", { name: "scrollable content" }).getByText(option, { exact: true }).click();
};

/** Walks a DropdownCascader court tree (e.g. ["General Court", "Blockchain"]) and confirms the last court. */
export const selectCourt = async (page: Page, path: string[], trigger: string | RegExp = "Select Court") => {
  await page.getByRole("button", { name: trigger }).click();
  const tree = page.getByRole("region", { name: "scrollable content" });
  for (const court of path) await tree.getByText(court, { exact: true }).click();
  await page.getByRole("button", { name: `Select ${path.at(-1)}` }).click();
};
