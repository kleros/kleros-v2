import { assert, describe, test } from "matchstick-as/assembly/index";
import { json } from "@graphprotocol/graph-ts";
import { extractDisputeKitIDFromExtraData, ONE, ZERO } from "../src/utils";
import { JSONValueToMaybeString } from "../../utils";
import { extraData } from "./utils/extra-data";

describe("utils - constants", () => {
  test("ZERO and ONE", () => {
    assert.stringEquals("0", ZERO.toString());
    assert.stringEquals("1", ONE.toString());
  });
});

describe("utils - extractDisputeKitIDFromExtraData", () => {
  test("reads the third 32-byte word as the dispute kit id", () => {
    assert.stringEquals("1", extractDisputeKitIDFromExtraData(extraData(1, 3, 1)));
    assert.stringEquals("2", extractDisputeKitIDFromExtraData(extraData(4, 3, 2)));
    assert.stringEquals("300", extractDisputeKitIDFromExtraData(extraData(1, 3, 300)));
  });

  test(
    "KNOWN BUG: does not modify the extraData it reads",
    () => {
      const data = extraData(1, 3, 2);
      const before = data.toHexString();
      extractDisputeKitIDFromExtraData(data);

      assert.stringEquals(before, data.toHexString());
    },
    true
  );
});

describe("subgraph/utils - JSONValueToMaybeString", () => {
  test("returns strings unchanged", () => {
    assert.stringEquals("hello", JSONValueToMaybeString(json.fromString('"hello"')));
  });

  test("renders booleans as text and numbers as hex", () => {
    assert.stringEquals("true", JSONValueToMaybeString(json.fromString("true")));
    assert.stringEquals("false", JSONValueToMaybeString(json.fromString("false")));
    assert.stringEquals("0xff", JSONValueToMaybeString(json.fromString("255")));
  });

  test("returns a hyphen for null and the default for other kinds", () => {
    assert.stringEquals("-", JSONValueToMaybeString(null));
    assert.stringEquals("-", JSONValueToMaybeString(json.fromString("null")));
    assert.stringEquals("-", JSONValueToMaybeString(json.fromString("[1]")));
    assert.stringEquals("n/a", JSONValueToMaybeString(json.fromString('{"a":1}'), "n/a"));
  });
});
