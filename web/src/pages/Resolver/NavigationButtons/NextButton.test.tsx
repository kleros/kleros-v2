import React from "react";

import { screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { describe, it, expect } from "vitest";

import { NewDisputeProvider } from "context/NewDisputeContext";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { renderWithProviders } from "src/test/renderWithProviders";

import NextButton from "./NextButton";

const CurrentPath: React.FC = () => <output aria-label="current path">{useLocation().pathname}</output>;

const completeDraft = {
  title: "Late delivery",
  description: "Parcel arrived late",
  question: "Refund?",
  courtId: "1",
  disputeKitId: DisputeKits.Classic,
  numberOfJurors: 3,
  arbitrationCost: "1000",
  policyURI: "/ipfs/QmPolicy",
  version: "1.0",
  answers: [
    { id: "1", title: "Yes", description: "Refund" },
    { id: "2", title: "No", description: "Keep" },
  ],
  aliasesArray: [{ name: "", address: "", id: "1" }],
};

const renderStep = (step: string, draft: object = completeDraft) => {
  localStorage.setItem("disputeData", JSON.stringify(draft));
  return renderWithProviders(
    <>
      <NextButton nextRoute="/resolver/next-step" />
      <CurrentPath />
    </>,
    { route: `/resolver/${step}`, providers: [NewDisputeProvider] }
  );
};

const next = () => screen.getByRole("button", { name: "Next" });

describe("Resolver NextButton", () => {
  it("navigates to the next step once the current step is complete", async () => {
    const { user } = renderStep("title");

    expect(next()).toBeEnabled();
    await user.click(next());

    expect(screen.getByRole("status", { name: "current path" })).toHaveTextContent("/resolver/next-step");
  });

  it.each([
    ["title", { title: "" }],
    ["description", { description: "" }],
    ["court", { courtId: undefined }],
    ["court", { disputeKitId: undefined }],
    ["jurors", { arbitrationCost: undefined }],
    ["jurors", { numberOfJurors: 0 }],
    ["voting-options", { question: "" }],
    ["voting-options", { answers: [{ id: "1", title: "Yes", description: "" }] }],
    ["notable-persons", { aliasesArray: [{ name: "Buyer", address: "0xnope", isValid: false }] }],
    ["policy", { policyURI: undefined }],
  ])("is disabled on /resolver/%s when %j", (step, override) => {
    renderStep(step, { ...completeDraft, ...override });
    expect(next()).toBeDisabled();
  });

  it("only validates the field of the current step", () => {
    renderStep("title", { ...completeDraft, description: "", policyURI: undefined });
    expect(next()).toBeEnabled();
  });

  it("accepts notable persons that are valid or left empty", () => {
    renderStep("notable-persons", {
      ...completeDraft,
      aliasesArray: [
        { name: "Buyer", address: "0x00000000000000000000000000000000000000b1", isValid: true },
        { name: " ", address: "", isValid: false },
      ],
    });
    expect(next()).toBeEnabled();
  });

  describe("court step with a gated dispute kit", () => {
    const gated = (disputeKitData?: object) => ({ ...completeDraft, disputeKitId: DisputeKits.Gated, disputeKitData });
    const tokenGate = { tokenGate: "0x00000000000000000000000000000000000000aa", isERC1155: false, tokenId: "0" };

    it("requires the token gate data", () => {
      renderStep("court", gated());
      expect(next()).toBeDisabled();
    });

    it.each([
      [null, false],
      [false, false],
      [true, true],
    ])("with isValid %j the button is enabled: %j", (isValid, enabled) => {
      renderStep("court", gated({ ...tokenGate, isValid }));
      if (enabled) expect(next()).toBeEnabled();
      else expect(next()).toBeDisabled();
    });
  });
});
