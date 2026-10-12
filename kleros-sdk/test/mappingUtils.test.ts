import { describe, expect, it } from "vitest";
import mustache from "mustache";
import { createResultObject } from "../src/dataMappings/utils/createResultObject";
import { replacePlaceholdersWithValues } from "../src/dataMappings/utils/replacePlaceholdersWithValues";
import retrieveVariables from "../src/dataMappings/utils/retrieveVariables";
import { lambdas } from "../src/dataMappings/utils/lambdas";
import { ActionMapping } from "../src/dataMappings/utils/actionTypes";
import { InvalidContextError } from "../src/errors";
import { isUndefined } from "../src";

describe("createResultObject", () => {
  const source = { a: { b: { c: 1 } }, list: [{ id: "x" }, { id: "y" }], zero: 0, empty: "" };

  it.each([
    { path: "a.b.c", expected: 1 },
    { path: "list[1].id", expected: "y" },
    { path: "list[0]", expected: { id: "x" } },
    { path: "zero", expected: 0 },
    { path: "empty", expected: "" },
  ])("reads $path", ({ path, expected }) => {
    expect(createResultObject(source, [path], ["out"])).toEqual({ out: expected });
  });

  it.each(["a.missing.c", "missing[0].id", "zero.anything", "list[5].id"])("omits the unresolvable path %s", (path) => {
    expect(createResultObject(source, [path], ["out"])).toEqual({});
  });

  it("pairs seek and populate by index", () => {
    expect(createResultObject(source, ["zero", "a.b.c"], ["first", "second"])).toEqual({ first: 0, second: 1 });
  });

  it("returns an empty result for null source data", () => {
    expect(createResultObject(null, ["a"], ["out"])).toEqual({});
  });
});

describe("retrieveVariables", () => {
  it("returns escaped, unescaped and ampersand variable names", () => {
    expect(retrieveVariables("{{a}} {{{b}}} {{&c}}")).toEqual(["a", "b", "c"]);
  });

  it("ignores section and comment tags", () => {
    expect(retrieveVariables("{{#s}}x{{/s}}{{^t}}y{{/t}}{{! note }}")).toEqual([]);
  });
});

describe("replacePlaceholdersWithValues", () => {
  const mapping = {
    type: "graphql",
    endpoint: "https://example.com/{{path}}",
    query: 'query { x(id: "{{id}}") }',
    variables: { id: "{{id}}", list: ["{{id}}", 3], flag: true, nothing: null },
    seek: ["x"],
    populate: ["x"],
  } as unknown as ActionMapping;

  it("renders every string leaf, including nested objects and arrays", () => {
    const result = replacePlaceholdersWithValues(mapping, { path: "subgraph", id: 42 });

    expect(result).toEqual({
      type: "graphql",
      endpoint: "https://example.com/subgraph",
      query: 'query { x(id: "42") }',
      variables: { id: "42", list: ["42", 3], flag: true, nothing: null },
      seek: ["x"],
      populate: ["x"],
    });
  });

  it.each([
    { name: "missing", context: { path: "p" } },
    { name: "null", context: { path: "p", id: null } },
  ])("throws InvalidContextError when a variable is $name", ({ context }) => {
    expect(() => replacePlaceholdersWithValues(mapping, context)).toThrow(InvalidContextError);
  });

  // issue: unfiled (mustache HTML-escapes values rendered into mapping endpoints, queries and args)
  it.fails("KNOWN BUG: renders context values verbatim, without HTML escaping", () => {
    const json = { type: "json", value: { v: "{{v}}" }, seek: [], populate: [] } as unknown as ActionMapping;

    const result = replacePlaceholdersWithValues(json, { v: '/ipfs/Qm&"<' }) as { value: { v: string } };

    expect(result.value.v).toBe('/ipfs/Qm&"<');
  });

  // issue: unfiled (validateContext looks up dotted names as flat keys)
  it.fails("KNOWN BUG: resolves a dotted variable against a nested context value", () => {
    const json = { type: "json", value: { v: "{{nested.v}}" }, seek: [], populate: [] } as unknown as ActionMapping;

    const result = replacePlaceholdersWithValues(json, { nested: { v: 7 } }) as { value: { v: string } };

    expect(result.value.v).toBe("7");
  });
});

describe("lambdas.hex", () => {
  const render = (template: string, view: Record<string, unknown>) =>
    mustache.render(template, { ...lambdas, ...view });

  it.each([
    { input: "255", expected: "0xff" },
    { input: "0", expected: "0x0" },
    { input: "not-a-number", expected: "not-a-number" },
  ])("renders $input as $expected", ({ input, expected }) => {
    expect(render("{{#hex}}{{n}}{{/hex}}", { n: input })).toBe(expected);
  });

  // issue: unfiled (parseInt loses precision above Number.MAX_SAFE_INTEGER)
  it.fails("KNOWN BUG: converts integers above 2^53 exactly", () => {
    const big = 2n ** 64n + 1n;

    expect(render("{{#hex}}{{n}}{{/hex}}", { n: big.toString() })).toBe(`0x${big.toString(16)}`);
  });
});

describe("isUndefined", () => {
  it.each([
    { value: undefined, expected: true },
    { value: null, expected: true },
    { value: 0, expected: false },
    { value: "", expected: false },
  ])("isUndefined($value) = $expected", ({ value, expected }) => {
    expect(isUndefined(value)).toBe(expected);
  });
});
