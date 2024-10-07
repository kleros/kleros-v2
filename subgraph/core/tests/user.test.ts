import { assert, test, describe } from "matchstick-as/assembly/index";
import { BigInt } from "@graphprotocol/graph-ts";
import { computeCoherenceScore } from "../src/entities/User";

describe("Compute coherence score", () => {
  test("Slam BigInts together", () => {
    assert.bigIntEquals(BigInt.fromI32(8), computeCoherenceScore(BigInt.fromI32(1), BigInt.fromI32(2)));
  });
});
