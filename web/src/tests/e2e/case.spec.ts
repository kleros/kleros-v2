import { expect, test } from "./fixtures";

test.describe("Case tests", () => {
  test("Should create a case", async ({ page, wallet }) => {
    await page.goto("/");
    await wallet.connect("alice");
    await page.goto("/#/resolver");

    // sign in
    await page.getByRole("button", { name: "Sign in to start" }).click();
    await expect(page.getByText("Create a case", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Next" }).click();

    await page.getByTestId("resolver-title-input").fill("Test Case");

    await page.getByRole("button", { name: "Next" }).click();

    await page.getByLabel("editable markdown").fill("Test description");

    await page.getByRole("button", { name: "Next" }).click();

    // Select General court
    await page.getByRole("button").filter({ hasText: "Select Court" }).click();
    await page.getByRole("paragraph").filter({ hasText: "General Court" }).click();
    await page.getByRole("button").filter({ hasText: "Select General Court" }).click();

    // select features
    await expect(page.getByText("Features in this Court", { exact: true })).toBeVisible();
    await page.getByText("Two-step commit-reveal", { exact: true }).click();
    await page.getByText("All the jurors in this court").click();
    await page.getByRole("button", { name: "Next" }).click();

    // fill category
    await page.getByRole("textbox", { name: "eg. Freelance" }).fill("Freelance");
    await page.getByRole("button", { name: "Next" }).click();

    // skip the number of jurors, already filled
    await page.getByRole("button", { name: "Next" }).click();

    // fill questions and answers
    await page.getByRole("textbox", { name: "eg. How much should Alice" }).fill("How much should Alice recieve?");
    await page.getByRole("textbox", { name: "eg. Pay 150 DAI" }).first().click();
    await page.getByRole("textbox", { name: "eg. Pay 150 DAI" }).first().fill("Pay 150 DAI");
    await page.getByRole("textbox", { name: "Description for Option 1" }).click();
    await page.getByRole("textbox", { name: "Description for Option 1" }).fill("Pay 150 DAI");
    await page.getByRole("textbox", { name: "eg. Pay 150 DAI" }).nth(1).click();
    await page.getByRole("textbox", { name: "eg. Pay 150 DAI" }).nth(1).fill("Pay 200 DAI");
    await page.getByRole("textbox", { name: "Description for Option 2" }).click();
    await page.getByRole("textbox", { name: "Description for Option 2" }).fill("Pay 200 DAI");
    await page.getByRole("button", { name: "Next" }).click();

    // fill aliases
    await page.getByRole("textbox", { name: "eg. Alice (Developer)" }).click();
    await page.getByRole("textbox", { name: "eg. Alice (Developer)" }).fill("Alice");
    await page.getByRole("textbox", { name: "eg. Alice.eth" }).click();
    await page.getByRole("textbox", { name: "eg. Alice.eth" }).fill("Alice.eth");
    await page.getByRole("button", { name: "Next" }).click();

    // input policy
    await page.getByRole("button").nth(5).click();
    await page.setInputFiles("input[type='file']", {
      name: "file.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("this is test"),
    });
    await page.getByRole("button", { name: "Next" }).click();

    // submit case
    await page.getByRole("button", { name: "Submit the case" }).click();
    await expect(page.getByRole("button", { name: "Check the case" })).toBeVisible({ timeout: 30_000 });
  });
});
