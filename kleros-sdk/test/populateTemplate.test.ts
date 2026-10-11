import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { populateTemplate, RefuseToArbitrateAnswer } from "../src";
import { aDispute, aTemplate } from "./fixtures/disputeDetails";

const yes = { id: "0x1", title: "Yes", description: "It complies" };
const no = { id: "0x2", title: "No", description: "It does not comply" };

describe("populateTemplate", () => {
  it("renders mustache variables and prepends the Refuse to Arbitrate answer", () => {
    const template = aTemplate({ question: "{{question}}", category: "General", lang: "en_US" });

    const result = populateTemplate(template, { question: "Did the user break the rules?" });

    expect(result).toEqual({
      ...aDispute({ category: "General", lang: "en_US" }),
      question: "Did the user break the rules?",
      answers: [RefuseToArbitrateAnswer, yes, no],
    });
  });

  it("renders a missing variable as an empty string", () => {
    const result = populateTemplate(aTemplate({ question: "{{missingQuestion}}" }), { question: "unused" });

    expect(result.question).toBe("");
  });

  it("adds Refuse to Arbitrate when the template has no answers", () => {
    expect(populateTemplate(aTemplate({ answers: [] }), {}).answers).toEqual([RefuseToArbitrateAnswer]);
  });

  it.each(["0x0", "0x00", "0x0000"])(
    "replaces the title of answer %s with Refuse to Arbitrate and keeps its description",
    (id) => {
      const custom = { id, title: "Custom Refuse Title", description: "Custom description", reserved: true };

      const result = populateTemplate(aTemplate({ answers: [custom, yes] }), {});

      expect(result.answers).toEqual([{ ...RefuseToArbitrateAnswer, description: "Custom description" }, yes]);
    }
  );

  it("applies the hex lambda", () => {
    const template = aTemplate({ metadata: { id: "{{#hex}}{{disputeId}}{{/hex}}" } });

    expect(populateTemplate(template, { disputeId: 255 }).metadata).toEqual({ id: "0xff" });
  });

  it("HTML-escapes interpolated values so they cannot break out of a JSON string", () => {
    const injected = '", "frontendUrl": "javascript:alert(1)';

    const result = populateTemplate(aTemplate({ title: "{{title}}" }), { title: injected });

    expect(result.title).toBe("&quot;, &quot;frontendUrl&quot;: &quot;javascript:alert(1)");
    expect(result).not.toHaveProperty("frontendUrl");
  });

  it("throws on a template that does not render to JSON", () => {
    expect(() => populateTemplate('{"title": "{{name}"}', { name: "Jane" })).toThrow();
  });

  it("throws a ZodError when a required field is missing", () => {
    const { title: _ignored, ...withoutTitle } = aDispute();

    expect(() => populateTemplate(JSON.stringify(withoutTitle), {})).toThrow(ZodError);
  });

  describe("sdk-populate-strict", () => {
    // issue: 2026-10-09-kleros-v2-dev-sdk-populate-strict
    it.fails("KNOWN BUG: strips unknown top-level keys", () => {
      const result = populateTemplate(aTemplate({ injected: "x" }), {});

      expect(result).not.toHaveProperty("injected");
    });

    // issue: 2026-10-09-kleros-v2-dev-sdk-populate-strict
    it.fails("KNOWN BUG: applies the schema default for extraEvidences", () => {
      expect(populateTemplate(aTemplate(), {}).extraEvidences).toEqual([]);
    });

    // issue: 2026-10-09-kleros-v2-dev-sdk-populate-strict
    it.fails("KNOWN BUG: rejects a template that uses triple mustache", () => {
      const template = aTemplate({ title: "{{{title}}}" });

      expect(() => populateTemplate(template, { title: "plain" })).toThrow();
    });
  });

  describe("answer-id-validation", () => {
    it.each(["1", "0x", "0xZZ", ""])("rejects the malformed answer id %j", (id) => {
      expect(() => populateTemplate(aTemplate({ answers: [{ ...yes, id }] }), {})).toThrow(ZodError);
    });

    // issue: 2026-10-09-kleros-v2-dev-answer-id-validation
    it.fails("KNOWN BUG: rejects duplicate answer ids", () => {
      const template = aTemplate({ answers: [yes, { ...no, id: "0x1" }] });

      expect(() => populateTemplate(template, {})).toThrow();
    });

    // issue: 2026-10-09-kleros-v2-dev-answer-id-validation
    it.fails("KNOWN BUG: rejects an answer id >= 2^256", () => {
      const template = aTemplate({ answers: [yes, { ...no, id: `0x${"f".repeat(80)}` }] });

      expect(() => populateTemplate(template, {})).toThrow();
    });

    // issue: 2026-10-09-kleros-v2-dev-answer-id-validation
    it.fails("KNOWN BUG: rejects a non-RTA title on answer id 0", () => {
      const template = aTemplate({ answers: [{ id: "0x00", title: "Yes", description: "" }, no] });

      expect(() => populateTemplate(template, {})).toThrow();
    });

    // issue: 2026-10-09-kleros-v2-dev-answer-id-validation
    it.fails("KNOWN BUG: rejects 0x0 and 0x00 in the same template", () => {
      const template = aTemplate({
        answers: [
          { id: "0x0", title: "Refuse", description: "" },
          { id: "0x00", title: "B", description: "" },
        ],
      });

      expect(() => populateTemplate(template, {})).toThrow();
    });
  });
});
