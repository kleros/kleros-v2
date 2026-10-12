import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { BigInt } from "@graphprotocol/graph-ts";
import { addUserActiveDispute, computeCoherenceScore, ensureUser, resolveUserDispute } from "../src/entities/User";
import { JUROR_A } from "./utils/constants";

const juror = JUROR_A.toHexString();

describe("Compute coherence score", () => {
  test("Slam BigInts together", () => {
    assert.bigIntEquals(BigInt.fromI32(8), computeCoherenceScore(BigInt.fromI32(1), BigInt.fromI32(2)));
  });

  test("smooths small samples towards zero and rounds half up", () => {
    assert.bigIntEquals(BigInt.fromI32(0), computeCoherenceScore(BigInt.fromI32(0), BigInt.fromI32(0)));
    // 1 / (1 + 10) * 100 = 9.09
    assert.bigIntEquals(BigInt.fromI32(9), computeCoherenceScore(BigInt.fromI32(1), BigInt.fromI32(1)));
    // 90 / (90 + 10) * 100 = 90
    assert.bigIntEquals(BigInt.fromI32(90), computeCoherenceScore(BigInt.fromI32(90), BigInt.fromI32(90)));
    // 5 / (10 + 10) * 100 = 25
    assert.bigIntEquals(BigInt.fromI32(25), computeCoherenceScore(BigInt.fromI32(5), BigInt.fromI32(10)));
  });
});

describe("User helpers", () => {
  afterEach(() => {
    clearStore();
  });

  test("ensureUser creates a zeroed user once", () => {
    ensureUser(juror);
    const again = ensureUser(juror);
    again.totalStake = BigInt.fromI32(5);
    again.save();
    ensureUser(juror);

    assert.entityCount("User", 1);
    assert.fieldEquals("User", juror, "userAddress", juror);
    assert.fieldEquals("User", juror, "totalStake", "5");
    assert.fieldEquals("User", juror, "coherenceScore", "0");
    assert.fieldEquals("User", juror, "disputes", "[]");
  });

  test("addUserActiveDispute counts each dispute once", () => {
    addUserActiveDispute(juror, "1");
    addUserActiveDispute(juror, "1");
    addUserActiveDispute(juror, "2");

    assert.fieldEquals("User", juror, "disputes", "[1, 2]");
    assert.fieldEquals("User", juror, "activeDisputes", "2");
    assert.fieldEquals("User", juror, "totalDisputes", "2");
  });

  test("resolveUserDispute moves a dispute from active to resolved once", () => {
    addUserActiveDispute(juror, "1");
    resolveUserDispute(juror, "1");
    resolveUserDispute(juror, "1");

    assert.fieldEquals("User", juror, "resolvedDisputes", "[1]");
    assert.fieldEquals("User", juror, "totalResolvedDisputes", "1");
    assert.fieldEquals("User", juror, "activeDisputes", "0");
  });
});
