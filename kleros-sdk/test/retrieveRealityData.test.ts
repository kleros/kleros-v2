import { describe, expect, it } from "vitest";
import { retrieveRealityData } from "../src/dataMappings/retrieveRealityData";
import { InvalidContextError, NotFoundError } from "../src/errors";
import { mockChain } from "./helpers/rpc";
import {
  ASKER,
  BOOL_QUESTION,
  newQuestionLog,
  newTemplateLog,
  QUESTION_ID,
  REALITY,
  REALITY_PROXY,
  SINGLE_SELECT_QUESTION,
} from "./fixtures/reality";

const ANSWERED_TOO_SOON = {
  id: "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
  title: "Answered Too Soon",
  description: "",
  reserved: true,
};

describe("retrieveRealityData", () => {
  it("builds Yes / No / Answered Too Soon answers for a bool question", async () => {
    mockChain({ logs: [newQuestionLog(), newTemplateLog(0)] });

    const result = await retrieveRealityData(QUESTION_ID, REALITY_PROXY);

    expect(result).toEqual({
      question: BOOL_QUESTION,
      type: "bool",
      realityAddress: REALITY,
      questionId: QUESTION_ID,
      realityUser: ASKER,
      answers: [
        { title: "Yes", description: "", id: "0x01", reserved: false, last: false },
        { title: "No", description: "", id: "0x02", reserved: false, last: false },
        { ...ANSWERED_TOO_SOON, last: true },
      ],
    });
  });

  it("reads the question by its id from the arbitrable contract", async () => {
    const chain = mockChain({ logs: [newQuestionLog(), newTemplateLog(0)] });

    await retrieveRealityData(QUESTION_ID, REALITY_PROXY);

    const [questionFilter] = chain.filters();
    expect(questionFilter.address).toBe(REALITY_PROXY);
    expect(questionFilter.topics?.[1]).toBe(QUESTION_ID);
    expect(questionFilter).toMatchObject({ fromBlock: "earliest", toBlock: "latest" });
  });

  it("returns only the reserved Answered Too Soon answer for a non-bool template", async () => {
    mockChain({
      logs: [
        newQuestionLog({ question: SINGLE_SELECT_QUESTION }),
        { ...newTemplateLog(2), args: { ...newTemplateLog(2).args, template_id: 0n } },
      ],
    });

    const result = await retrieveRealityData(QUESTION_ID, REALITY_PROXY);

    expect(result.type).toBe("single-select");
    expect(result.answers).toEqual([{ ...ANSWERED_TOO_SOON, last: true }]);
  });

  it("throws InvalidContextError without an arbitrable address", async () => {
    await expect(retrieveRealityData(QUESTION_ID)).rejects.toThrow(InvalidContextError);
  });

  // issue: unfiled (LogNewTemplate is always filtered with template id 0)
  it.fails("KNOWN BUG: reads the template named by the question's template_id", async () => {
    mockChain({
      logs: [
        newQuestionLog({ templateId: 2n, question: SINGLE_SELECT_QUESTION }),
        newTemplateLog(0),
        newTemplateLog(2),
      ],
    });

    const result = await retrieveRealityData(QUESTION_ID, REALITY_PROXY);

    expect(result.type).toBe("single-select");
  });

  // issue: 2026-10-09-kleros-v2-dev-mapping-timeouts-caps
  it.fails("KNOWN BUG: an unknown question id rejects with NotFoundError", async () => {
    mockChain({ logs: [newTemplateLog(0)] });

    await expect(retrieveRealityData(QUESTION_ID, REALITY_PROXY)).rejects.toThrow(NotFoundError);
  });
});
