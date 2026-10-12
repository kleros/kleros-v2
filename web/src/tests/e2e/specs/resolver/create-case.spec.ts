import { disputeResolver } from "../../contracts";
import { expect, test } from "../../fixtures";
import { selectCourt } from "../../pages/dropdown";

test.describe("dispute resolver", () => {
  test("walks every step to a preview of the new case", async ({ page, wallet, atlas, rpc }) => {
    rpc.onCall(disputeResolver, "createDisputeForTemplate", () => 13n);
    await page.goto("/#/resolver");
    await wallet.connect("alice");

    await page.getByRole("button", { name: "Sign in to start" }).click();
    await expect(page.getByText("Create a case", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();

    await page.getByRole("textbox", { name: "Case title" }).fill("Late delivery refund");
    await page.getByRole("button", { name: "Next" }).click();

    await page.getByLabel("editable markdown").fill("The buyer asks for a refund.");
    await page.getByRole("button", { name: "Next" }).click();

    await selectCourt(page, ["General Court"]);
    await expect(page.getByText("Features in this Court", { exact: true })).toBeVisible();
    // The court only supports the classic kit, so its features come preselected.
    await expect(page.getByRole("radio", { name: "All the jurors in this court" })).toBeChecked();
    await page.getByRole("button", { name: "Next" }).click();

    await page.getByRole("textbox", { name: "Case category" }).fill("Freelance");
    await page.getByRole("button", { name: "Next" }).click();

    // Number of jurors keeps its default.
    await page.getByRole("button", { name: "Next" }).click();

    await page.getByRole("textbox", { name: "Question" }).fill("Should the buyer be refunded?");
    // Both description fields are labelled "Option Description"; the placeholder tells them apart.
    await page.getByRole("textbox", { name: "Voting Option 1" }).fill("Refund");
    await page.getByPlaceholder("Description for Option 1").fill("Refund the buyer");
    await page.getByRole("textbox", { name: "Voting Option 2" }).fill("No refund");
    await page.getByPlaceholder("Description for Option 2").fill("Pay the seller");
    await page.getByRole("button", { name: "Next" }).click();

    // Notable persons are optional.
    await page.getByRole("button", { name: "Next" }).click();

    await page.locator("input[type='file']").setInputFiles({
      name: "policy.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("e2e policy"),
    });
    await page.getByRole("button", { name: "Next" }).click();

    await expect(page.getByRole("heading", { name: "Late delivery refund" })).toBeVisible();
    await expect(page.getByText("Should the buyer be refunded?")).toBeVisible();
    await expect(page.getByText(/Refund\s*-\s*Refund the buyer/)).toBeVisible();
    await expect(page.getByText(/No refund\s*-\s*Pay the seller/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit the case" })).toBeEnabled();
    expect(rpc.transactions).toEqual([]);
    expect(atlas.uploads).toBe(1);
  });
});
