import { describe, expect, it } from "vitest";
import { jsonAction } from "../../src/dataMappings/actions/jsonAction";
import { JsonMapping } from "../../src/dataMappings/utils/actionTypes";

const fileURI = { photo: "https://photo.url", video: "https://video.url" };

describe("jsonAction", () => {
  it("maps fields of an object value", () => {
    const mapping: JsonMapping = {
      type: "json",
      value: fileURI,
      seek: ["photo", "video"],
      populate: ["photoUrl", "videoUrl"],
    };

    expect(jsonAction(mapping)).toEqual({ photoUrl: "https://photo.url", videoUrl: "https://video.url" });
  });

  it("parses a JSON string value", () => {
    const mapping = {
      type: "json",
      value: JSON.stringify({ a: { b: [10, 20] } }),
      seek: ["a.b"],
      populate: ["list"],
    } as unknown as JsonMapping;

    expect(jsonAction(mapping)).toEqual({ list: [10, 20] });
  });

  it("returns an empty result when no sought field exists", () => {
    const mapping: JsonMapping = { type: "json", value: {}, seek: ["missing"], populate: ["out"] };

    expect(jsonAction(mapping)).toEqual({});
  });

  it("throws on a malformed JSON string value", () => {
    const mapping = { type: "json", value: "{not json", seek: [], populate: [] } as unknown as JsonMapping;

    expect(() => jsonAction(mapping)).toThrow(SyntaxError);
  });
});
