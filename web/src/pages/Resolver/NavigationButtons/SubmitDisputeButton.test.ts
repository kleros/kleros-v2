import { describe, it, expect } from "vitest";

import type { IDisputeTemplate } from "context/NewDisputeContext";

import { isTemplateValid } from "./SubmitDisputeButton";

describe("isTemplateValid", () => {
  const template: IDisputeTemplate = {
    title: "Late delivery",
    description: "Parcel arrived late",
    question: "Refund?",
    policyURI: "/ipfs/QmPolicy",
    answers: [
      { id: "1", title: "Yes", description: "Refund" },
      { id: "2", title: "No", description: "No refund" },
    ],
    version: "1.0",
  };

  it("accepts a template with title, description, policy, question and described answers", () => {
    expect(isTemplateValid(template)).toBeTruthy();
  });

  it.each([
    ["title", { title: "" }],
    ["description", { description: "" }],
    ["policyURI", { policyURI: undefined }],
    ["question", { question: "" }],
    ["an answer title", { answers: [{ id: "1", title: "", description: "Refund" }] }],
    ["an answer description", { answers: [{ id: "1", title: "Yes", description: "" }] }],
  ])("rejects a template missing %s", (_, override) => {
    expect(isTemplateValid({ ...template, ...override })).toBeFalsy();
  });
});
