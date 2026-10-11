import { anEvidence } from "../../builders/subgraph";
import { evidenceModule } from "../../contracts";
import { expect, test } from "../../fixtures";

test.describe("case evidence", () => {
  test("lists submitted evidence and searches it", async ({ page, subgraph }) => {
    const dispute = subgraph.world.disputes[0];
    subgraph.world.evidences.push(
      anEvidence(dispute, 0, { name: "Delivery receipt", description: "Signed by the buyer." }),
      anEvidence(dispute, 1, { name: "Chat log", description: "Seller admits the delay." })
    );
    await page.goto("/#/cases/1/evidence");

    await expect(page.getByText("Delivery receipt")).toBeVisible();
    await expect(page.getByText("Chat log")).toBeVisible();

    await page.getByRole("textbox", { name: /Search evidence/ }).fill("delay");

    await expect(page.getByText("Chat log")).toBeVisible();
    await expect(page.getByText("Delivery receipt")).toBeHidden();
    expect(subgraph.calls.map((c) => c.field)).toContain("evidenceSearch");
  });

  test("signs in to Atlas and submits evidence on chain", async ({ page, wallet, rpc, atlas }) => {
    rpc.onCall(evidenceModule, "submitEvidence", () => undefined);
    await page.goto("/#/cases/1/evidence");
    await wallet.connect("alice");

    await page.getByRole("button", { name: "Submit Evidence" }).click();
    await page.getByRole("textbox", { name: "editable markdown" }).fill("The parcel arrived damaged.");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("button", { name: "Submit", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Submit New Evidence" })).toBeHidden();
    const [submission] = rpc.sent(evidenceModule, "submitEvidence");
    expect(submission.args[0]).toBe(1n);
    expect(JSON.parse(submission.args[1])).toEqual({
      name: "Evidence",
      description: "The parcel arrived damaged.",
      fileURI: null,
    });
    expect(atlas.operations.map((o) => o.operationName)).toEqual(expect.arrayContaining(["GetNonce", "Login"]));
  });
});
